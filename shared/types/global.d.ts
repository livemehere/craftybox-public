declare global {
  declare class EyeDropper {
    open: () => Promise<{ sRGBHex: string }>;
  }
}

export {};
