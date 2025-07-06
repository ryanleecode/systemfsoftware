import { addVitePlugin, defineIntegration } from 'astro-integration-kit'
import { z } from 'astro/zod'
import { dirname, join } from 'node:path'
import { virtualConfigModule } from './vite.js'

export default defineIntegration({
  name: 'better-auth-astro',
  optionsSchema: z.object({
    /**
     * Defines the base path for the auth routes.
     * @default '/api/auth'
     */
    prefix: z.string().default('/api/auth'),
    /**
     * Defines whether or not you want the integration to handle the API routes
     * @default true
     */
    injectEndpoints: z.boolean().default(true),
    /**
     * Path to the config file
     */
    configFile: z.string().optional(),
  }).default({}),
  setup({ name, options }) {
    return {
      name,
      hooks: {
        'astro:config:setup': async (params) => {
          const {
            config: astroConfig,
            injectRoute,
            injectScript,
            logger,
          } = params

          addVitePlugin(params, {
            plugin: virtualConfigModule(options.configFile),
            warnDuplicated: true,
          })

          params.updateConfig({
            vite: {
              optimizeDeps: { exclude: ['auth:config'] },
            },
          })

          if (options.injectEndpoints) {
            const currentDir = dirname(import.meta.url.replace('file://', ''))
            const entrypoint = join(`${currentDir}/api/[...auth].js`)
            injectRoute({
              pattern: `${options.prefix}/[...auth]`,
              entrypoint,
            })
          }

          if (!astroConfig.adapter) {
            logger.error('No Adapter found, please make sure you provide one in your Astro config')
            return
          }

          const edge = ['@astrojs/vercel/edge', '@astrojs/cloudflare', 'astro-sst'].includes(
            astroConfig.adapter.name,
          )

          if (process.env.NODE_ENV === 'development' && edge) {
            injectScript(
              'page-ssr',
              `import crypto from "node:crypto";
if (!globalThis.crypto) globalThis.crypto = crypto;
if (typeof globalThis.crypto.subtle === "undefined") globalThis.crypto.subtle = crypto.webcrypto.subtle;
if (typeof globalThis.crypto.randomUUID === "undefined") globalThis.crypto.randomUUID = crypto.randomUUID;
`,
            )
          }
        },
      },
    }
  },
})
