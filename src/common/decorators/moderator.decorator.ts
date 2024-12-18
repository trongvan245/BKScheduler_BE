import { SetMetadata } from "@nestjs/common";

export const STUDENT_KEY = "isSTUDENT";
export const ADD_STUDENT = () => SetMetadata(STUDENT_KEY, true);
