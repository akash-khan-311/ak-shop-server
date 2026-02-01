/* eslint-disable prettier/prettier */
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
export const normalizeCode = (code: string) => code.trim().toUpperCase();

export const ensureRole = (role: string, allowed: string[]) => {
    if (!allowed.includes(role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not allowed to perform this action')
    }
}