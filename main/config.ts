export const config = {
  IS_DEV: process.env.NODE_ENV === 'development',
  RENDERER_DEV_URL: process.env['RENDERER_URL'],
  IS_MAC: process.platform === 'darwin',
} as const;
