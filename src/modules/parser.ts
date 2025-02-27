import fs from "fs";
import {LogEntry, LogStatistic} from "../types";
import {isLogLevel} from "../utils";

const expectedFileHeader = ['timestamp', 'level', 'source', 'message'];

export function createParser() {
    let parsedContent: LogEntry[] = [];
    let statistics: LogStatistic | null = null;

    return {
        parseCSVFile: async (filename: string) => {
            parsedContent = await parseCSVFile(filename);
        },
        getParsedContent: (filters?: Partial<LogEntry>): LogEntry[] =>
            filters ? filterContent(parsedContent, filters) : parsedContent,
        calculateStatisticData: (): void => {statistics = calculateStatisticData(parsedContent)},
        getStatisticData: (): LogStatistic|null => statistics,
    };
}

function parseCSVFile(filename: string): Promise<LogEntry[]> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filename)) {
            throw new Error(`Could not find file "${filename}"`);
        }

        const fileContent: string = fs.readFileSync(filename, "utf8");
        const logLines: string[] = fileContent.trim().split("\r\n");

        if (logLines.length < 2) {
            return reject(`File "${filename}" is empty`);
        }

        if (!validateHeader(logLines[0])) {
            return reject(`File "${filename}" has incorrect format`);
        }

        logLines.shift(); // delete csv header

        resolve(convertLinesToObjects(logLines));
    });
}

function validateHeader(header: string): boolean {
    let headerAsArray: string[] = header.split(',');
    return headerAsArray.length === expectedFileHeader.length
        && expectedFileHeader.every(header => headerAsArray.includes(header));
}

function convertLinesToObjects(lines: string[]): LogEntry[] {
    return lines.map((line) => {
        let lineAsArray: string[] = line.split(',');

        if (!isLogLevel(lineAsArray[1])) {
            throw new Error(`Could not parse log level "${lineAsArray[1]}"`);
        }

        return {
            timestamp: lineAsArray[0],
            level: lineAsArray[1],
            source: lineAsArray[2],
            message: lineAsArray[3],
        };
    });
}

function filterContent(logLines: LogEntry[], filters: Partial<LogEntry>): LogEntry[] {
    let filteredContent: LogEntry[] = logLines;

    for (const [field, filterValue] of Object.entries(filters)) {
        filteredContent = filteredContent.filter((logEntry: LogEntry)=>
            logEntry[field as keyof LogEntry].toLowerCase() === filterValue.toLowerCase()
        );
    }

    return filteredContent
}

function calculateStatisticData(logLines: LogEntry[]): LogStatistic {
    let totalRows: number = logLines.length;
    let firstErrorAt: string = '';
    let lastErrorAt: string = '';
    let errorsAmount: number = 0;
    let infosAmount: number = 0;
    let warningsAmount: number = 0;
    let debugsAmount: number = 0;

    logLines.forEach((logEntry: LogEntry) => {
        if (logEntry.level.toLowerCase() === "error") {
            errorsAmount++;

            if (firstErrorAt === '' || new Date(logEntry.timestamp) < new Date(firstErrorAt)) {
                firstErrorAt = logEntry.timestamp;
            }
            if (lastErrorAt === '' || new Date(logEntry.timestamp) > new Date(lastErrorAt)) {
                lastErrorAt = logEntry.timestamp;
            }

        } else if (logEntry.level.toLowerCase() === "warning") {
            warningsAmount++
        } else if (logEntry.level.toLowerCase() === "info") {
            infosAmount++
        } else if (logEntry.level.toLowerCase() === "debug") {
            debugsAmount++
        }
    })

    return {
        totalRows: totalRows,
        firstErrorAt: firstErrorAt,
        lastErrorAt: lastErrorAt,
        errorsAmount: errorsAmount,
        infosAmount: infosAmount,
        warningsAmount: warningsAmount,
        debugsAmount: debugsAmount,
    }
}
