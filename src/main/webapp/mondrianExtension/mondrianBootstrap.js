(function () {

    if (window.__MONDRIAN_BOOTSTRAP_INITIALIZED__) {
        return;
    }

    window.__MONDRIAN_BOOTSTRAP_INITIALIZED__ = true;

    console.log("Mondrian Diagrams bootstrap loaded");

    const BASE = 'mondrianExtension';

    // ------------------------------------------------------------
    // Utilities
    // ------------------------------------------------------------

    function loadScript(src) {

        return new Promise((resolve, reject) => {

            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const s = document.createElement('script');

            s.type = 'text/javascript';
            s.src = src;
            s.async = false;

            s.onload = resolve;

            s.onerror = () => reject(
                new Error('Failed to load ' + src)
            );

            document.head.appendChild(s);
        });
    }

    function getBaseUrl() {

        const url = new URL(window.location.href);

        url.hash = '';
        url.search = '';

        url.pathname =
            url.pathname.replace(/\/[^/]*$/, '');

        return url.toString().replace(/\/$/, '');
    }

    // ------------------------------------------------------------
    // Runtime configuration
    // ------------------------------------------------------------

    function applyBaseUrls() {

        const base = getBaseUrl();

        window.DRAWIO_SERVER_URL =
            window.DRAWIO_SERVER_URL || (base + '/');

        window.DRAWIO_BASE_URL =
            window.DRAWIO_BASE_URL || base;

        window.DRAWIO_VIEWER_URL =
            window.DRAWIO_VIEWER_URL ||
            (base + '/js/viewer.min.js');

        window.DRAWIO_LIGHTBOX_URL =
            window.DRAWIO_LIGHTBOX_URL || base;
    }

    function applyUrlParams() {

        window.urlParams =
            window.urlParams || {};

        const defaults = {

            sync: 'manual',
            browser: '1',

            gh: '1',
            gl: '1',

            db: '0',
            tr: '0',
            picker: '0',
            gapi: '0',
            od: '0'
        };

        Object.keys(defaults).forEach((key) => {

            if (
                typeof window.urlParams[key]
                === 'undefined'
            ) {
                window.urlParams[key] =
                    defaults[key];
            }
        });
    }

    // ------------------------------------------------------------
    // Config
    // ------------------------------------------------------------

    async function loadMondrianConfig() {

        const baseUrl = getBaseUrl();

        try {

            const res = await fetch(
                `${baseUrl}/mondrian/mondrianDiagrams.configuration`
            );

            if (!res.ok) {
                throw new Error(
                    `HTTP ${res.status}`
                );
            }

            const config = await res.json();

            window.DRAWIO_CONFIG = Object.assign(
                {},
                window.DRAWIO_CONFIG || {},
                config.appConfiguration || {}
            );

            if (config.github) {

                window.DRAWIO_GITHUB_ID =
                    config.github.clientId;

                window.DRAWIO_GITHUB_APP =
                    config.github.appUrl;
            }

        } catch (e) {

            console.warn(
                'Mondrian: config load failed',
                e
            );

            window.DRAWIO_CONFIG =
                window.DRAWIO_CONFIG || {};
        }
    }

    // ------------------------------------------------------------
    // Runtime init
    // ------------------------------------------------------------

    async function initMondrianRuntime() {

        if (
            typeof window.createMondrianCore
            === 'function'
        ) {

            window.MONDRIAN_CORE =
                window.createMondrianCore();
        }

        return new Promise((resolve) => {

            if (
                typeof window.createMondrianRepo
                === 'function'
            ) {

                try {

                    window.createMondrianRepo(
                        function (repo) {

                            window.MONDRIAN_REPO =
                                repo;

                            resolve(repo);
                        }
                    );

                } catch (e) {

                    console.error(
                        'Mondrian repo init failed',
                        e
                    );

                    resolve();
                }

            } else {

                console.warn(
                    'Mondrian: createMondrianRepo not found'
                );

                resolve();
            }
        });
    }

    // ------------------------------------------------------------
    // Branding
    // ------------------------------------------------------------

    function overrideLogo() {

        if (window.Editor) {

            Editor.logoImage =
                `${BASE}/images/mondrianIcon.png`;
        }
    }

    function overrideFavicon() {

        document
            .querySelectorAll("link[rel*='icon']")
            .forEach(el => el.remove());

        const link =
            document.createElement('link');

        link.rel = 'icon';
        link.type = 'image/png';

        link.href =
            `${BASE}/images/favicon-mondrian-32x32.png`;

        document.head.appendChild(link);
    }

    function removeExternalRefs() {

        document
            .querySelectorAll(
                'meta[itemprop="image"]'
            )
            .forEach(el => el.remove());

        document
            .querySelectorAll(
                'link[rel="canonical"]'
            )
            .forEach(el => el.remove());
    }

    // ------------------------------------------------------------
    // Shared init
    // ------------------------------------------------------------

    async function initMondrian() {

        applyBaseUrls();
        applyUrlParams();

        removeExternalRefs();

        const isStaticViewer =
            typeof window.GraphViewer !== 'undefined';

        if (!isStaticViewer) {
            overrideFavicon();
            await loadMondrianConfig();
            overrideLogo();
        }

        await initMondrianRuntime();

    }

    // ------------------------------------------------------------
    // Viewer runtime
    // ------------------------------------------------------------

    if (

        typeof window.GraphViewer !== 'undefined' ||

        window.location.href.indexOf(
            'lightbox=1'
        ) >= 0 ||

        document.querySelector('.mxgraph')
        != null

    ) {

        window.onDrawioViewerLoad =
            async function () {

                try {


                    await initMondrian();


                    if (
                        typeof GraphViewer !== 'undefined' &&
                        typeof GraphViewer.processElements === 'function'
                    ) {

                        GraphViewer.processElements();
                    }

                } catch (e) {

                    console.error(
                        'Mondrian: viewer bootstrap failed',
                        e
                    );
                }
            };

        return;
    }

    // ------------------------------------------------------------
    // Editor runtime
    // ------------------------------------------------------------

    function hookCheckAllLoaded(
        retries = 100
    ) {

        if (
            typeof window.checkAllLoaded
            === 'function'
        ) {

            const originalCheckAllLoaded =
                window.checkAllLoaded;

            if (
                originalCheckAllLoaded
                    .__mondrianHooked
            ) {
                return;
            }

            let mondrianBooting = false;
            let mondrianReady = false;

            window.checkAllLoaded =
                function () {

                    if (
                        !window.mxScriptsLoaded ||
                        !window.mxWinLoaded
                    ) {

                        return originalCheckAllLoaded
                            .apply(this, arguments);
                    }

                    if (mondrianReady) {

                        return originalCheckAllLoaded
                            .apply(this, arguments);
                    }

                    if (mondrianBooting) {
                        return;
                    }

                    mondrianBooting = true;

                    initMondrian()

                        .then(() => {

                            mondrianReady = true;

                            originalCheckAllLoaded
                                .apply(
                                    window,
                                    arguments
                                );
                        })

                        .catch((e) => {

                            console.error(
                                'Mondrian: bootstrap failed',
                                e
                            );

                            mondrianReady = true;

                            originalCheckAllLoaded
                                .apply(
                                    window,
                                    arguments
                                );
                        });
                };

            window.checkAllLoaded
                .__mondrianHooked = true;

        } else if (retries > 0) {

            setTimeout(
                () => hookCheckAllLoaded(
                    retries - 1
                ),
                25
            );

        } else {

            console.error(
                'Mondrian: checkAllLoaded not found'
            );
        }
    }

    hookCheckAllLoaded();

})();