export default (html, version = "1") => {
    return (req, res, next) => {
        if (
            req.method === "GET" &&
            req.headers["x-inertia"] &&
            req.headers["x-inertia-version"] !== version
        ) {
            return res.writeHead(409, { "X-Inertia-Location": req.url }).end();
        }

        let _headers = {};
        let _viewData = {};
        let _statusCode = 200;
        let _sharedProps = {};

        const Inertia = {
            setHeaders(headers) {
                _headers = { ..._headers, ...headers };
                return this;
            },

            setViewData(viewData) {
                _viewData = { ..._viewData, viewData };
                return this;
            },

            setStatusCode(statusCode) {
                _statusCode = statusCode;
                return this;
            },

            shareProps(sharedProps) {
                _sharedProps = { ..._sharedProps, ...sharedProps };
                return this;
            },

            async render({ props, component }) {
                let page = {
                    version,
                    component,
                    props: {},
                    url: req.originalUrl || req.url,
                };

                const allProps = { ..._sharedProps, ...props };

                let dataKeys;

                if (
                    req.headers["x-inertia-partial-data"] &&
                    req.headers["x-inertia-partial-component"] === component
                ) {
                    dataKeys = req.headers["x-inertia-partial-data"].split(",");
                } else {
                    dataKeys = Object.keys(allProps);
                }

                for (const key of dataKeys) {
                    if (typeof allProps[key] === "function") {
                        page.props[key] = await allProps[key]();
                    } else {
                        page.props[key] = allProps[key];
                    }
                }

                if (req.headers["x-inertia"]) {
                    res.writeHead(_statusCode, {
                        ..._headers,
                        "Content-Type": "application/json",
                        "X-Inertia": "true",
                        Vary: "Accept",
                    }).end(JSON.stringify(page));
                } else {
                    const encodedPageString = JSON.stringify(page)
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");

                    // res
                    //   .writeHead(_statusCode, {
                    //     ..._headers,
                    //     'Content-Type': 'text/html',
                    //   })
                    //   .end(html(encodedPageString, _viewData));
                    // res.render('index');
                    return res.render("index");
                }
            },

            redirect(url = req.headers["referer"]) {
                const statusCode = ["PUT", "PATCH", "DELETE"].includes(
                    req.method
                )
                    ? 303
                    : 302;

                res.writeHead(statusCode, { ..._headers, Location: url }).end();
            },
        };

        req.Inertia = Inertia;

        next();
    };
};
