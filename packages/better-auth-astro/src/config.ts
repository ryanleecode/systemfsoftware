import type { AuthConfig as LocalAuthConfig } from '@auth/core/types'

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

export interface FullAuthConfig extends AstroAuthConfig, Omit<LocalAuthConfig, 'raw'> {}

export const defineConfig = (config: FullAuthConfig) => {
  config.prefix ??= '/api/auth'
  config.basePath = config.prefix
  return config
}

export type { LocalAuthConfig }
