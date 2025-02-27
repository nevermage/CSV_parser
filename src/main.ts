
import {createParser} from "./modules/parser";
import {LogEntry} from "./types";

main('./large_logs.csv');

async function main(fileName: string) {
    try {
        const parser = createParser();
        await parser.parseCSVFile(fileName);
        const fileContentFiltered: LogEntry[] = parser.getParsedContent({source: 'API', level: 'debug'});
        console.log(fileContentFiltered);
        parser.calculateStatisticData();
        console.log(parser.getStatisticData());
    } catch (err) {
        console.error(err);
        throw err;
    }
}

