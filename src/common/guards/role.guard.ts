import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtPayLoad } from "../model/jwt-payload.interface";
import { GENERAL_MESSAGE } from "../constants";
import { ADMIN_KEY } from "../decorators";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminRoute = this.reflector.getAllAndOverride<boolean>(ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user: JwtPayLoad = request.user;
    // console.log(user);
    // console.log(request.headers["authorization"]);
    // if (user.role == "STUDENT" && isAdminRoute) {
    //   throw new ForbiddenException(GENERAL_MESSAGE.STUDENT_NOT_ALLOWED);
    // }
    //currently no RBAC

    return true;
  }
}
