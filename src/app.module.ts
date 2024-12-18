import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtGuard } from "./common/guards";

@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: JwtGuard }],
})
export class AppModule {}
