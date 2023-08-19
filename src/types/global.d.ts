// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';

declare module 'three/examples/jsm/controls/FlyControls' {
  interface FlyControls {
    status: number;
  }
}
