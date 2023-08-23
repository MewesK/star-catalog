import fs from 'node:fs';

import { parse } from 'csv-parse';
import { BrowserWindow } from 'electron';

import hygData35Csv from '../../resources/hygdata_v35.csv?asset';
import { Star } from '../types/Star';

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
              id: parseInt(line.id),
              hip: parseInt(line.hip),
              hd: parseInt(line.hd),
              hr: parseInt(line.hr),
              gl: line.gl,
              bf: line.bf,
              proper: line.proper,
              ra: parseFloat(line.ra),
              dec: parseFloat(line.dec),
              dist: parseFloat(line.dist),
              pmra: parseFloat(line.pmra),
              pmdec: parseFloat(line.pmdec),
              rv: parseFloat(line.rv),
              mag: parseFloat(line.mag),
              absmag: parseFloat(line.absmag),
              spect: line.spect,
              ci: parseFloat(line.ci),
              x: parseFloat(line.x),
              y: parseFloat(line.y),
              z: parseFloat(line.z),
              vx: parseFloat(line.vx),
              vy: parseFloat(line.vy),
              vz: parseFloat(line.vz),
              rarad: parseFloat(line.rarad),
              decrad: parseFloat(line.decrad),
              pmrarad: parseFloat(line.pmrarad),
              pmdecrad: parseFloat(line.pmdecrad),
              bayer: line.bayer,
              flam: line.flam,
              con: line.con,
              comp: parseInt(line.comp),
              comp_primary: parseInt(line.comp_primary),
              base: line.base,
              lum: parseFloat(line.lum),
              var: line.var,
              var_min: parseFloat(line.var_min),
              var_max: parseFloat(line.var_max)
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
