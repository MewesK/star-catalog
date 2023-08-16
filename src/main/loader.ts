import fs from 'fs';
import { parse } from 'csv-parse';
import { BrowserWindow } from 'electron';
import { Star } from '../types/Star';

import hygData35Csv from '../../resources/hygdata_v35.csv?asset';

export default function (window: BrowserWindow): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const parser = parse({
        columns: true,
        delimiter: ',',
        skip_empty_lines: true,
        trim: true
      })
        .on('readable', () => {
          const buffer = [] as Star[];
          let star: Star;
          while ((star = parser.read()) !== null) {
            buffer.push(star);
          }
          if (buffer.length > 0) {
            window.webContents.send('update', buffer);
          }
        })
        .on('error', (e) => reject(e))
        .on('end', () => {
          window.webContents.send('update', []);
          resolve();
        });

      fs.createReadStream(hygData35Csv)
        .on('data', (data) => parser.write(data.toString()))
        .on('end', () => parser.end());
    } catch (e) {
      reject(e);
    }
  });
}
