// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
declare module 'three/examples/jsm/controls/FlyControls' {
  interface FlyControls {
    moveState: {
      up: 0;
      down: 0;
      left: 0;
      right: 0;
      forward: 0;
      back: 0;
      pitchUp: 0;
      pitchDown: 0;
      yawLeft: 0;
      yawRight: 0;
      rollLeft: 0;
      rollRight: 0;
    };
  }
}
