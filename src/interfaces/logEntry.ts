import {LogLevel} from "../types/logLevel";

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    source: string;
    message: string;
}