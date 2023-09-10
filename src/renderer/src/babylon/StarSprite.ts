import { ISpriteManager, Sprite } from '@babylonjs/core';
import { Star } from 'src/types/Star';

export class StarSprite extends Sprite {
  readonly star: Star;
  constructor(name: string, star: Star, manager: ISpriteManager) {
    super(name, manager);
    this.star = star;
  }
}
