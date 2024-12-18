import { SetMetadata } from "@nestjs/common";

export const ADMIN_KEY = "isADMIN";
export const ADD_ADMIN = () => SetMetadata(ADMIN_KEY, true);
