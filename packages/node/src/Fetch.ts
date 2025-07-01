import { ProxyAgent } from 'undici'

/**
 * Proxy configuration for fetch requests
 */
export interface ProxyConfig {
  url: string
  username?: string
  password?: string
}

export interface FetchWithProxyInit extends RequestInit {
  proxy?: ProxyConfig
}

/**
 * Creates a fetch function with proxy support
 */
export function createFetchWithProxy(baseFetch = globalThis.fetch) {
  return async function fetchWithProxy(
    input: string | URL,
    init?: FetchWithProxyInit,
  ): Promise<Response> {
    const { proxy, ...fetchInit } = init || {}

    if (!proxy) {
      return baseFetch(input, fetchInit)
    }

    const proxyOptions: { uri: string; token?: string } = { uri: proxy.url }

    if (proxy.username && proxy.password) {
      proxyOptions.token = `Basic ${Buffer.from(`${proxy.username}:${proxy.password}`).toString('base64')}`
    }

    const proxyAgent = new ProxyAgent(proxyOptions)

    const modifiedInit: RequestInit = {
      ...fetchInit,
      dispatcher: proxyAgent,
    }

    return baseFetch(input, modifiedInit)
  }
}

/**
 * Default fetch instance with proxy support
 */
export const proxiedFetch = createFetchWithProxy()

/**
 * Creates a fetch function with predefined proxy configuration
 */
export function createProxiedFetch(proxyConfig: ProxyConfig) {
  const fetchWithProxy = createFetchWithProxy()

  return async function proxiedFetch(
    input: string | URL,
    init?: RequestInit,
  ): Promise<Response> {
    return fetchWithProxy(input, { ...init, proxy: proxyConfig })
  }
}
