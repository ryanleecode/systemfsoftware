import { ProxyAgent } from 'undici'
import type { fetch as undiciFetch } from 'undici'

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

type CompatibleFetch = typeof globalThis.fetch | typeof undiciFetch

function isRequestLike(input: unknown): input is Request {
  return !!(
    input &&
    typeof input === 'object' &&
    'url' in input &&
    'method' in input &&
    'headers' in input
  )
}

function normalizeRequestInput(input: string | URL | Request): [string | URL, RequestInit] {
  if (isRequestLike(input)) {
    return [
      input.url,
      {
        method: input.method,
        headers: new Headers(input.headers),
        body: input.body,
        referrer: input.referrer,
        referrerPolicy: input.referrerPolicy,
        mode: input.mode,
        credentials: input.credentials,
        cache: input.cache,
        redirect: input.redirect,
        integrity: input.integrity,
        signal: input.signal,
      },
    ]
  }
  return [input, {}]
}

function normalizeProxy(proxy: string | URL | ProxyConfig): ProxyConfig {
  if (typeof proxy === 'string' || proxy instanceof URL) {
    return { url: proxy.toString() }
  }
  return proxy
}

function createProxyAgent(proxyConfig: ProxyConfig): ProxyAgent {
  const proxyUrl = new URL(proxyConfig.url)
  const proxyOptions: { uri: string; token?: string } = {
    uri: `${proxyUrl.protocol}//${proxyUrl.host}`,
  }

  if (proxyUrl.username && proxyUrl.password) {
    proxyOptions.token = `Basic ${Buffer.from(`${proxyUrl.username}:${proxyUrl.password}`).toString('base64')}`
  } else if (proxyConfig.username && proxyConfig.password) {
    proxyOptions.token = `Basic ${Buffer.from(`${proxyConfig.username}:${proxyConfig.password}`).toString('base64')}`
  }

  return new ProxyAgent(proxyOptions)
}

/**
 * Creates a fetch function with proxy support
 *
 * Automatically normalizes Request objects to avoid cross-realm issues with undici.
 *
 * @example
 * ```typescript
 * import { createFetchWithProxy } from '@systemfsoftware/node'
 * import { fetch as undiciFetch } from 'undici'
 *
 * const fetch = createFetchWithProxy()
 * const fetchWithUndici = createFetchWithProxy(undiciFetch)
 *
 * const response = await fetch('https://api.example.com', {
 *   proxy: 'http://proxy.example.com:8080'
 * })
 * ```
 */
export function createFetchWithProxy(baseFetch: CompatibleFetch = globalThis.fetch) {
  return async function fetchWithProxy(
    input: string | URL | Request,
    init?: FetchWithProxyInit,
  ): Promise<Response> {
    const { proxy, ...fetchInit } = init || {}
    const [normalizedInput, requestInit] = normalizeRequestInput(input)
    const mergedInit = { ...requestInit, ...fetchInit }

    if (!proxy) {
      return baseFetch(normalizedInput, mergedInit)
    }

    const proxyConfig = normalizeProxy(proxy)
    const proxyAgent = createProxyAgent(proxyConfig)

    const modifiedInit: RequestInit = {
      ...mergedInit,
      dispatcher: proxyAgent,
    }

    return baseFetch(normalizedInput, modifiedInit)
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
