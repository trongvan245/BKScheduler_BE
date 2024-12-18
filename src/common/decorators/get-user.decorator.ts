import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayLoad } from '../model/jwt-payload.interface';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayLoad => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);