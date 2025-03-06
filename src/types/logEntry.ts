import {LogLevel} from "./logLevel";

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    source: string;
    message: string;
}