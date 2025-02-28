import fs from "fs";
import {LogEntry, LogStatistic} from "../types";
import csv from 'csv-parser';

export function createParser() {
    const parsedContent: LogEntry[] = [];
    let statistics: LogStatistic | null = null;

    return {
        parseCSVFile: async (filename: string) => {
            const parsedData = await parseCSVFile(filename);
            parsedContent.push(...parsedData);
        },
        getParsedContent: (filters?: Partial<LogEntry>): LogEntry[] =>
            filters ? filterContent(parsedContent, filters) : parsedContent,
        calculateStatisticData: (): void => {statistics = calculateStatisticData(parsedContent)},
        getStatisticData: (): LogStatistic|null => statistics,
    };
}

function parseCSVFile(filename: string): Promise<LogEntry[]> {
    // throw an error before returning a promise
    if (!fs.existsSync(filename)) {
        throw new Error(`Could not find file "${filename}"`);
    }

    return new Promise((resolve, reject) => {
        const results: LogEntry[] = [];

        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (data: Record<string, string>) => {
                results.push({
                    timestamp: data.timestamp,
                    level: data.level as LogEntry['level'],
                    source: data.source,
                    message: data.message,
                });
            })
            .on('end', () => {resolve(results)})
            .on('error', (err: Error) => reject(err))
    });
}

function filterContent(logLines: LogEntry[], filters: Partial<LogEntry>): LogEntry[] {
    return logLines.reduce((acc: LogEntry[], logEntry: LogEntry) => {
        for (const [field, filterValue] of Object.entries(filters)) {
            if (logEntry[field as keyof LogEntry].toLowerCase() === filterValue.toLowerCase()) {
                acc.push(logEntry);
            }
        }
        return acc;
    }, []);
}

function calculateStatisticData(logLines: LogEntry[]): LogStatistic {
    const calcData: LogStatistic = {
        totalRows: logLines.length,
        firstErrorAt: '',
        lastErrorAt: '',
        errorsAmount: 0,
        infosAmount: 0,
        warningsAmount: 0,
        debugsAmount: 0,
    };

    logLines.forEach((logEntry: LogEntry) => {
        if (logEntry.level.toLowerCase() === "error") {
            calcData.errorsAmount++;

            if (calcData.firstErrorAt === '' || new Date(logEntry.timestamp) < new Date(calcData.firstErrorAt)) {
                calcData.firstErrorAt = logEntry.timestamp;
            }
            if (calcData.lastErrorAt === '' || new Date(logEntry.timestamp) > new Date(calcData.lastErrorAt)) {
                calcData.lastErrorAt = logEntry.timestamp;
            }

        } else if (logEntry.level.toLowerCase() === "warning") {
            calcData.warningsAmount++
        } else if (logEntry.level.toLowerCase() === "info") {
            calcData.infosAmount++
        } else if (logEntry.level.toLowerCase() === "debug") {
            calcData.debugsAmount++
        }
    })

    return calcData;
}
