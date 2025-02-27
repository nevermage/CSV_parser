
import {createParser} from "./modules/parser";
import {LogEntry} from "./interfaces/logEntry";

main();

async function main() {
    let fileName: string = './large_logs.csv';

    try {
        const parser = createParser();
        await parser.parseCSVFile(fileName);
        let fileContentFiltered: LogEntry[] = parser.getParsedContent({source: 'API', level: 'debug'});
        console.log(fileContentFiltered);
        parser.calculateStatisticData();
        console.log(parser.getStatisticData());
    } catch (err) {
        console.error(err);
    }
}

