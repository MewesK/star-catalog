import fs from 'fs/promises';
import { parse } from 'csv-parse';
import { Star } from '../types';

import hygData35Csv from '../../resources/hygdata_v35.csv?asset';

export default async function (): Promise<Star[]> {
  const records = [] as Star[];
  const input = await fs.readFile(hygData35Csv);
  await new Promise<Star[]>((resolve, reject) => {
    const parser = parse(input, {
      columns: true,
      delimiter: ',',
      skip_empty_lines: true,
      trim: true
    });
    parser
      .on('readable', () => {
        let record: Star;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      })
      .on('error', reject)
      .on('end', resolve);
  });
  return records;
}
