import { Injectable } from "@nestjs/common";
import { Response } from "express";

@Injectable()
export class InertiaService {
    _reqHeaders = {};
    _headers = {};
    _viewData = {};
    _statusCode = 200;
    _sharedProps = {};
    _originalUrl = null;
    _url = null;
    _res: Response = null;

    setHeaders(headers: object) {
        this._headers = { ...this._headers, ...headers };
        return this;
    }
    setViewData(viewData: object) {
        this._viewData = { ...this._viewData, viewData };
        return this;
    }

    setStatusCode(statusCode: number) {
        this._statusCode = statusCode;
        return this;
    }

    shareProps(sharedProps: object) {
        this._sharedProps = { ...this._sharedProps, ...sharedProps };
        return this;
    }

    html(pageString, viewData) {
        return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
        
            <!-- Custom data -->
            <title>${viewData.title}</title>
        
            <!-- Your React, Vue or Svelte SPA -->
            <link rel="stylesheet" href="/build/bundle.css" />
            <script defer type="module" src="/build/main.js"></script>
          </head>
        
          <!-- The Inertia page object -->
          <body id="app" data-page='${pageString}'></body>
        </html>
        `;
    }

    async render(props: object, component: string) {
        const page = {
            version: new Date().getTime(),
            component,
            props: {},
            url: this._originalUrl || this._url,
        };

        const allProps = { ...this._sharedProps, ...props };

        let dataKeys;

        if (
            this._reqHeaders["x-inertia-partial-data"] &&
            this._reqHeaders["x-inertia-partial-component"] === component
        ) {
            dataKeys = this._reqHeaders["x-inertia-partial-data"].split(",");
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
        if (
            this._reqHeaders["x-inertia-partial-data"] &&
            this._reqHeaders["x-inertia-partial-component"] === component
        ) {
            dataKeys = this._reqHeaders["x-inertia-partial-data"].split(",");
        } else {
            dataKeys = Object.keys(allProps);
        }
        const encodedPageString = JSON.stringify(page);
        if (this._reqHeaders["x-inertia"]) {
            this._res
                .writeHead(this._statusCode, {
                    ...this._headers,
                    "Content-Type": "application/json",
                    "X-Inertia": "true",
                    Vary: "Accept",
                })
                .end(encodedPageString);
        } else {
            this._res
                .writeHead(this._statusCode, {
                    ...this._headers,
                    "Content-Type": "text/html",
                })
                .end(
                    this.html(
                        encodedPageString
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;"),
                        this._viewData
                    )
                );
        }
    }

    getHello(): string {
        return "Hello World!";
    }
}
