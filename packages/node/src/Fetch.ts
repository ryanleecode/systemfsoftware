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
  proxy?: string | URL | ProxyConfig
}

/**
 * Creates a fetch function with proxy support
 */
export function createFetchWithProxy(baseFetch = globalThis.fetch) {
  return async function fetchWithProxy(
    input: string | URL | Request,
    init?: FetchWithProxyInit,
  ): Promise<Response> {
    const { proxy, ...fetchInit } = init || {}

    if (!proxy) {
      return baseFetch(input, fetchInit)
    }

    // Normalize proxy to ProxyConfig
    let proxyConfig: ProxyConfig
    if (typeof proxy === 'string' || proxy instanceof URL) {
      proxyConfig = { url: proxy.toString() }
    } else {
      proxyConfig = proxy
    }

    // Parse proxy URL to extract credentials
    const proxyUrl = new URL(proxyConfig.url)
    const proxyOptions: { uri: string; token?: string } = { 
      uri: `${proxyUrl.protocol}//${proxyUrl.host}` 
    }

    // Check for credentials in URL (like http://user:pass@proxy.com:8000)
    if (proxyUrl.username && proxyUrl.password) {
      proxyOptions.token = `Basic ${Buffer.from(`${proxyUrl.username}:${proxyUrl.password}`).toString('base64')}`
    }
    // Fallback to explicit username/password
    else if (proxyConfig.username && proxyConfig.password) {
      proxyOptions.token = `Basic ${Buffer.from(`${proxyConfig.username}:${proxyConfig.password}`).toString('base64')}`
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
export function createProxiedFetch(proxyConfig: string | URL | ProxyConfig) {
  const fetchWithProxy = createFetchWithProxy()

  return async function proxiedFetch(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> {
    return fetchWithProxy(input, { ...init, proxy: proxyConfig })
  }
}
