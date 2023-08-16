import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
declare module 'three/examples/jsm/controls/FlyControls' {
  interface FlyControls {
    status: number;
    pointerup: (event: PointerEvent) => void;
  }
}
