import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { InertiaMiddleware } from "./Inertia.middleware";
import { InertiaService } from "./Inertia.service";

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService, InertiaService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(InertiaMiddleware).forRoutes("/");
    }
}
