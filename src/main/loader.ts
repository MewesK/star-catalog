import fs from 'fs';
import { parse } from 'csv-parse';
import { Star } from '../types';

import hygData35Csv from '../../resources/hygdata_v35.csv?asset';

export default function (): Promise<Star[]> {
  const records = [] as Star[];
  return new Promise<Star[]>((resolve, reject) => {
    const parser = parse({
      columns: true,
      delimiter: ',',
      skip_empty_lines: true,
      trim: true
    })
      .on('readable', () => {
        let record: Star;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      })
      .on('error', (e) => reject(e))
      .on('end', () => resolve(records));

    fs.createReadStream(hygData35Csv)
      .on('data', (data) => parser.write(data.toString()))
      .on('end', () => parser.end());
  });
}
