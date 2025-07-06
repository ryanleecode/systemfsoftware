import type { PluginOption } from 'vite'

export const virtualConfigModule = (configFile: string = './auth.config'): PluginOption => {
  const virtualModuleId = 'auth:config'
  const resolvedId = '\0' + virtualModuleId

  return {
    name: 'auth-astro-config',
    resolveId: (id) => {
      if (id === virtualModuleId) {
        return resolvedId
      }
    },
    load: (id) => {
      if (id === resolvedId) {
        return `import authConfig from "${configFile}"; export default authConfig`
      }
    },
  }
}
