import fs from 'node:fs';

import { parse } from 'csv-parse';
import { BrowserWindow } from 'electron';

import hygData35Csv from '../../resources/hygdata_v35.csv?asset';
import { Star } from '../types/Star';

function toInt<T>(value: string, empty: T): number | T {
  return value === '' ? empty : parseInt(value);
}
function toFloat<T>(value: string, empty: T): number | T {
  return value === '' ? empty : parseFloat(value);
}
function toString<T>(value: string, empty: T): string | T {
  return value === '' ? empty : value;
}

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
          let line: Record<string, string>;
          while ((line = parser.read()) !== null) {
            buffer.push({
              id: toInt(line.id, 0),
              hip: toInt(line.hip, null),
              hd: toInt(line.hd, null),
              hr: toInt(line.hr, null),
              gl: toString(line.gl, null),
              bf: toString(line.bf, null),
              proper: toString(line.proper, null),
              ra: toFloat(line.ra, 0.0),
              dec: toFloat(line.dec, 0.0),
              dist: toFloat(line.dist, 0.0),
              pmra: toFloat(line.pmra, 0.0),
              pmdec: toFloat(line.pmdec, 0.0),
              rv: toFloat(line.rv, 0.0),
              mag: toFloat(line.mag, 0.0),
              absmag: toFloat(line.absmag, 0.0),
              spect: toString(line.spect, null),
              ci: toFloat(line.ci, 0.0),
              x: toFloat(line.x, 0.0),
              y: toFloat(line.y, 0.0),
              z: toFloat(line.z, 0.0),
              vx: toFloat(line.vx, 0.0),
              vy: toFloat(line.vy, 0.0),
              vz: toFloat(line.vz, 0.0),
              rarad: toFloat(line.rarad, 0.0),
              decrad: toFloat(line.decrad, 0.0),
              pmrarad: toFloat(line.pmrarad, 0.0),
              pmdecrad: toFloat(line.pmdecrad, 0.0),
              bayer: toString(line.bayer, null),
              flam: toString(line.flam, null),
              con: toString(line.con, null),
              comp: toInt(line.comp, 0),
              comp_primary: toInt(line.comp_primary, 0),
              base: toString(line.base, null),
              lum: toFloat(line.lum, 0.0),
              var: toString(line.var, null),
              var_min: toFloat(line.var_min, null),
              var_max: toFloat(line.var_max, null)
            });
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
