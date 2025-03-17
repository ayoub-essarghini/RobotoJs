import { RobotoElement } from './roboto';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends RobotoElement {}
  }
}

export {};