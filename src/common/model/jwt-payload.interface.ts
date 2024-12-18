// import { UserRole } from "@prisma/client";

export interface JwtPayLoad {
  sub: string;
  email: string;
  // role: UserRole;
  iat?: number;
  exp?: number;
}
