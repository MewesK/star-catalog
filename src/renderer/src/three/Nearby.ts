/**
 * @see https://github.com/oguzeroglu/Nearby
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Oğuz Eroğlu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
export default class Nearby {
  static DEFAULT_BIN_SIZE = 50;

  limitBox: Box;
  binSize: number;

  readonly bin = new Map();
  readonly reusableResultMap = new Map<BoxObject, boolean>();

  constructor(width: number, height: number, depth: number, binSize = Nearby.DEFAULT_BIN_SIZE) {
    this.limitBox = new Box(0, 0, 0, width, height, depth);
    this.binSize = binSize;
  }

  insert(obj: BoxObject): void {
    if (!this.limitBox.containsBox(obj.box)) {
      return;
    }

    const BIN_SIZE = this.binSize;

    const box = obj.box;
    const minX = box.minX;
    const minY = box.minY;
    const minZ = box.minZ;
    const maxX = box.maxX;
    const maxY = box.maxY;
    const maxZ = box.maxZ;

    let round = Math.round(minX / BIN_SIZE) * BIN_SIZE;
    const minXLower = round <= minX ? round : round - BIN_SIZE;

    round = Math.round(maxX / BIN_SIZE) * BIN_SIZE;
    let maxXLower = round < maxX ? round : round - BIN_SIZE;
    if (minXLower > maxXLower) {
      maxXLower = minXLower;
    }

    round = Math.round(minY / BIN_SIZE) * BIN_SIZE;
    const minYLower = round <= minY ? round : round - BIN_SIZE;

    round = Math.round(maxY / BIN_SIZE) * BIN_SIZE;
    let maxYLower = round < maxY ? round : round - BIN_SIZE;
    if (minYLower > maxYLower) {
      maxYLower = minYLower;
    }

    round = Math.round(minZ / BIN_SIZE) * BIN_SIZE;
    const minZLower = round <= minZ ? round : round - BIN_SIZE;

    round = Math.round(maxZ / BIN_SIZE) * BIN_SIZE;
    let maxZLower = round < maxZ ? round : round - BIN_SIZE;
    if (minZLower > maxZLower) {
      maxZLower = minZLower;
    }

    for (let x = minXLower; x <= maxXLower; x += BIN_SIZE) {
      if (!this.bin.has(x)) {
        this.bin.set(x, new Map());
      }
      if (!obj.binInfo.has(x)) {
        obj.binInfo.set(x, new Map());
      }
      for (let y = minYLower; y <= maxYLower; y += BIN_SIZE) {
        if (!this.bin.get(x).has(y)) {
          this.bin.get(x).set(y, new Map());
        }
        if (!obj.binInfo.get(x).has(y)) {
          obj.binInfo.get(x).set(y, new Map());
        }
        for (let z = minZLower; z <= maxZLower; z += BIN_SIZE) {
          if (!this.bin.get(x).get(y).has(z)) {
            this.bin.get(x).get(y).set(z, new Map());
          }
          this.bin.get(x).get(y).get(z).set(obj, true);
          obj.binInfo.get(x).get(y).set(z, true);
        }
      }
    }
  }

  query(x: number, y: number, z: number): Map<BoxObject, boolean> {
    const BIN_SIZE = this.binSize;

    const rX = Math.round(x / BIN_SIZE) * BIN_SIZE;
    const minX = rX <= x ? rX : rX - BIN_SIZE;

    const rY = Math.round(y / BIN_SIZE) * BIN_SIZE;
    const minY = rY <= y ? rY : rY - BIN_SIZE;

    const rZ = Math.round(z / BIN_SIZE) * BIN_SIZE;
    const minZ = rZ <= z ? rZ : rZ - BIN_SIZE;

    const result = this.reusableResultMap;
    result.clear();

    for (let xDiff = -BIN_SIZE; xDiff <= BIN_SIZE; xDiff += BIN_SIZE) {
      const keyX = minX + xDiff;
      for (let yDiff = -BIN_SIZE; yDiff <= BIN_SIZE; yDiff += BIN_SIZE) {
        const keyY = minY + yDiff;
        for (let zDiff = -BIN_SIZE; zDiff <= BIN_SIZE; zDiff += BIN_SIZE) {
          const keyZ = minZ + zDiff;
          if (this.bin.has(keyX) && this.bin.get(keyX).has(keyY)) {
            const res = this.bin.get(keyX).get(keyY).get(keyZ);
            if (!res) {
              continue;
            }
            for (const obj of res.keys()) {
              result.set(obj, true);
            }
          }
        }
      }
    }

    return result;
  }

  delete(obj: BoxObject): void {
    const binInfo = obj.binInfo;

    for (const x of binInfo.keys()) {
      for (const y of binInfo.get(x).keys()) {
        for (const z of binInfo.get(x).get(y).keys()) {
          if (this.bin.has(x) && this.bin.get(x).has(y) && this.bin.get(x).get(y).has(z)) {
            this.bin.get(x).get(y).get(z).delete(obj);
            if (this.bin.get(x).get(y).get(z).size == 0) {
              this.bin.get(x).get(y).delete(z);
            }
            if (this.bin.get(x).get(y).size == 0) {
              this.bin.get(x).delete(y);
            }
            if (this.bin.get(x).size == 0) {
              this.bin.delete(x);
            }
          }
        }
      }
    }

    for (const x of binInfo.keys()) {
      binInfo.delete(x);
    }
  }

  update(
    obj: BoxObject,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
  ): void {
    obj.box.setFromCenterAndSize(x, y, z, width, height, depth);
    this.delete(obj);
    this.insert(obj);
  }
}

export class Box {
  minX = 0;
  maxX = 0;
  minY = 0;
  maxY = 0;
  minZ = 0;
  maxZ = 0;

  constructor(x: number, y: number, z: number, width: number, height: number, depth: number) {
    this.setFromCenterAndSize(x, y, z, width, height, depth);
  }

  containsBox(box: Box): boolean {
    return (
      this.minX <= box.minX &&
      box.maxX <= this.maxX &&
      this.minY <= box.minY &&
      box.maxY <= this.maxY &&
      this.minZ <= box.minZ &&
      box.maxZ <= this.maxZ
    );
  }

  setFromCenterAndSize(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
  ): void {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    this.minX = x - halfWidth;
    this.maxX = x + halfWidth;
    this.minY = y - halfHeight;
    this.maxY = y + halfHeight;
    this.minZ = z - halfDepth;
    this.maxZ = z + halfDepth;
  }
}

export class BoxObject {
  id: number;
  box: Box;
  binInfo = new Map();

  constructor(id: number, box: Box) {
    this.id = id;
    this.box = box;
  }
}
