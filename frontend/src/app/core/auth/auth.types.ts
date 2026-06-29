import { UserRole } from "../../shared/types/user.types";

export type AuthUser = { id: number; email: string; rol: UserRole };