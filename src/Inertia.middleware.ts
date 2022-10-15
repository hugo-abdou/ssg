import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { InertiaService } from "./Inertia.service";

@Injectable()
export class InertiaMiddleware implements NestMiddleware {
    constructor(private inertiaService: InertiaService) {}
    use(req: Request, res: Response, next: NextFunction) {
        if (req.method === "GET" && req.headers["x-inertia"]) {
            return res.writeHead(409, { "X-Inertia-Location": req.url }).end();
        }
        this.inertiaService._reqHeaders = req.headers;
        this.inertiaService._res = res;
        this.inertiaService._originalUrl = req.originalUrl;
        this.inertiaService._url = req.url;

        next();
    }
}
