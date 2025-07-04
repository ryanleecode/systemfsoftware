declare module 'auth:config' {
  import type { AuthConfig } from '@auth/core/types'

  export type { AuthConfig }

  export interface AstroAuthConfig {
    /**
     * Defines the base path for the auth routes.
     * @default '/api/auth'
     */
    prefix?: string
    /**
     * Defineds wether or not you want the integration to handle the API routes
     * @default true
     */
    injectEndpoints?: boolean
    /**
     * Path to the config file
     */
    configFile?: string
  }

  export interface FullAuthConfig extends AstroAuthConfig, Omit<AuthConfig, 'raw'> {}

  const config: FullAuthConfig
  export default config
}

declare module 'auth-astro' {
  const index: import('./src/index').Integration

  type FullAuthConfig = import('./src/config').FullAuthConfig
  const defineConfig: (config: FullAuthConfig) => FullAuthConfig
  export default index
  export { defineConfig }
}

declare module '*.astro' {
  const Component: any
  export default Component
}
