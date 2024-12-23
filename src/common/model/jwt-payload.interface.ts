// import { UserRole } from "@prisma/client";

export interface JwtPayLoad {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
