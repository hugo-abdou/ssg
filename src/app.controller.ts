import { Get, Controller, Scope, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { InertiaService } from "./Inertia.service";
// import { AppService } from './app.service';

@Controller({
    scope: Scope.DEFAULT,
})
export class AppController {
    constructor(private inertiaService: InertiaService) {}
    @Get()
    root(@Res() res: Response) {
        this.inertiaService.render({}, "test");
    }
}
