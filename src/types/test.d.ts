/// <reference types="jest" />
/// <reference types="@testing-library/jest-native" />

import '@testing-library/jest-native/extend-expect';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWith(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(times: number): R;
      toBeOnTheScreen(): R;
      toBeVisible(): R;
      toBeEnabled(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveProp(prop: string, value?: any): R;
    }
  }
}

declare module '*.png';
declare module '*.jpg';
declare module '*.json';
declare module '*.svg';

declare module '@testing-library/react-native' {
  export interface RenderOptions {
    wrapper?: React.ComponentType<any>;
  }
}

// Add missing WebSocket types for tests
interface WebSocket {
  url: string;
  readyState: number;
  onopen: ((this: WebSocket, ev: Event) => any) | null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null;
  onerror: ((this: WebSocket, ev: Event) => any) | null;
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
  close(code?: number, reason?: string): void;
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
}

declare global {
  interface Window {
    WebSocket: {
      prototype: WebSocket;
      new(url: string, protocols?: string | string[]): WebSocket;
      readonly CONNECTING: 0;
      readonly OPEN: 1;
      readonly CLOSING: 2;
      readonly CLOSED: 3;
    };
  }
  
  var WebSocket: {
    prototype: WebSocket;
    new(url: string, protocols?: string | string[]): WebSocket;
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSING: 2;
    readonly CLOSED: 3;
  };
}

export {};
