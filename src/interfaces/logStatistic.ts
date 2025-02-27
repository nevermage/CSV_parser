export interface LogStatistic {
    totalRows: number;
    firstErrorAt: string;
    lastErrorAt: string;
    errorsAmount: number;
    infosAmount: number;
    warningsAmount: number;
    debugsAmount: number;
}