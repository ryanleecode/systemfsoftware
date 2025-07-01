import { GenericContainer } from 'testcontainers'
import type { StartedTestContainer } from 'testcontainers'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createFetchWithProxy, createProxiedFetch, proxiedFetch, type ProxyConfig } from './Fetch.js'

describe('fetch with proxy support', () => {
  let targetContainer: StartedTestContainer

  beforeAll(async () => {
    targetContainer = await new GenericContainer('oven/bun:1')
      .withCopyContentToContainer([{
        content: `const server = Bun.serve({
  port: 3000,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url);
    console.log(\`Test server request: \${req.method} \${url.pathname}\`);
    
    if (url.pathname === '/success') {
      return new Response('SUCCESS_FROM_BUN_CONTAINER', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    if (url.pathname === '/error') {
      return new Response('ERROR_FROM_BUN_CONTAINER', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    return new Response('DEFAULT_FROM_BUN_CONTAINER', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  },
});

console.log(\`Test server running on port \${server.port}\`);`,
        target: '/server.js',
      }])
      .withCommand(['bun', 'run', '/server.js'])
      .withExposedPorts(3000)
      .start()
  }, 30000)

  afterAll(async () => {
    if (targetContainer) await targetContainer.stop()
  })

  describe('createFetchWithProxy', () => {
    it('should work without proxy', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      const response = await fetchWithProxy(targetUrl)
      expect(response.ok).toBe(true)

      const text = await response.text()
      expect(text).toBe('SUCCESS_FROM_BUN_CONTAINER')
    })

    it('should handle different response codes', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/error`

      const response = await fetchWithProxy(targetUrl)
      expect(response.status).toBe(500)

      const text = await response.text()
      expect(text).toBe('ERROR_FROM_BUN_CONTAINER')
    })

    it('should fail with invalid proxy', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      const invalidProxyConfig = {
        url: 'http://127.0.0.1:9999',
      }

      await expect(
        fetchWithProxy(targetUrl, { proxy: invalidProxyConfig }),
      ).rejects.toThrow()
    })

    it('should handle proxy with basic auth', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      const proxyConfigWithAuth: ProxyConfig = {
        url: 'http://127.0.0.1:9999',
        username: 'testuser',
        password: 'testpass',
      }

      await expect(
        fetchWithProxy(targetUrl, { proxy: proxyConfigWithAuth }),
      ).rejects.toThrow()
    })

    it('should handle invalid proxy hostnames', async () => {
      const fetchWithProxy = createFetchWithProxy()

      const invalidProxyConfig: ProxyConfig = {
        url: 'http://nonexistent-proxy-host-12345.invalid:8080',
      }

      await expect(
        fetchWithProxy('http://example.com', { proxy: invalidProxyConfig }),
      ).rejects.toThrow()
    })
  })

  describe('createProxiedFetch', () => {
    it('should create function with predefined proxy config', async () => {
      const proxyConfig: ProxyConfig = {
        url: 'http://127.0.0.1:9999',
      }

      const proxiedFetchFn = createProxiedFetch(proxyConfig)
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      await expect(
        proxiedFetchFn(targetUrl),
      ).rejects.toThrow()
    })

    it('should merge init options with proxy config', async () => {
      const proxyConfig: ProxyConfig = {
        url: 'http://127.0.0.1:9999',
      }

      const proxiedFetchFn = createProxiedFetch(proxyConfig)
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      await expect(
        proxiedFetchFn(targetUrl, { method: 'POST' }),
      ).rejects.toThrow()
    })
  })

  describe('proxiedFetch', () => {
    it('should be the default exported instance', () => {
      expect(typeof proxiedFetch).toBe('function')
    })
  })
})
