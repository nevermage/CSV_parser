import { LogLevel } from "../types";

const availableTypes = ['info', 'warning', 'error', 'debug'];

export function isLogLevel(string: string): string is LogLevel {
    return availableTypes.includes(string.toLowerCase());
}