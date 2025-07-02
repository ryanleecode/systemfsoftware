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

    it('should handle proxy as string URL', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      const proxyUrl = 'http://127.0.0.1:9999'

      await expect(
        fetchWithProxy(targetUrl, { proxy: proxyUrl }),
      ).rejects.toThrow()
    })

    it('should handle proxy as URL object', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      const proxyUrl = new URL('http://127.0.0.1:9999')

      await expect(
        fetchWithProxy(targetUrl, { proxy: proxyUrl }),
      ).rejects.toThrow()
    })

    it('should handle proxy string with embedded credentials', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      const proxyWithAuth = 'http://testuser:testpass@127.0.0.1:9999'

      await expect(
        fetchWithProxy(targetUrl, { proxy: proxyWithAuth }),
      ).rejects.toThrow()
    })

    it('should handle URL object with embedded credentials', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      const proxyUrl = new URL('http://testuser:testpass@127.0.0.1:9999')

      await expect(
        fetchWithProxy(targetUrl, { proxy: proxyUrl }),
      ).rejects.toThrow()
    })

    it('should handle Apify-style proxy URLs', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      // Simulate Apify proxy format
      const apifyProxyUrl = 'http://auto:mock_password_123@proxy.apify.com:8000'

      await expect(
        fetchWithProxy(targetUrl, { proxy: apifyProxyUrl }),
      ).rejects.toThrow() // Will fail because proxy doesn't exist, but tests the parsing
    })

    it('should extract credentials from URL properly', async () => {
      const fetchWithProxy = createFetchWithProxy()
      
      // Test that the function doesn't throw on URL parsing
      // We can't easily test the actual credential extraction without a real proxy,
      // but we can verify the URL parsing works
      const proxyWithComplexAuth = 'http://user%40domain.com:p%40ssw0rd@proxy.example.com:8080'
      
      await expect(
        fetchWithProxy('http://example.com', { proxy: proxyWithComplexAuth }),
      ).rejects.toThrow() // Proxy doesn't exist, but URL parsing should work
    })

    it('should work with different input types (string, URL, Request)', async () => {
      const fetchWithProxy = createFetchWithProxy()
      const baseUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      // Test with string
      const response1 = await fetchWithProxy(baseUrl)
      expect(response1.ok).toBe(true)

      // Test with URL
      const response2 = await fetchWithProxy(new URL(baseUrl))
      expect(response2.ok).toBe(true)

      // Test with Request
      const response3 = await fetchWithProxy(new Request(baseUrl))
      expect(response3.ok).toBe(true)
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
    it('should create function with predefined proxy config object', async () => {
      const proxyConfig: ProxyConfig = {
        url: 'http://127.0.0.1:9999',
      }

      const proxiedFetchFn = createProxiedFetch(proxyConfig)
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      await expect(
        proxiedFetchFn(targetUrl),
      ).rejects.toThrow()
    })

    it('should create function with predefined proxy string', async () => {
      const proxyUrl = 'http://127.0.0.1:9999'

      const proxiedFetchFn = createProxiedFetch(proxyUrl)
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      await expect(
        proxiedFetchFn(targetUrl),
      ).rejects.toThrow()
    })

    it('should create function with predefined proxy URL object', async () => {
      const proxyUrl = new URL('http://127.0.0.1:9999')

      const proxiedFetchFn = createProxiedFetch(proxyUrl)
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      await expect(
        proxiedFetchFn(targetUrl),
      ).rejects.toThrow()
    })

    it('should create function with proxy string containing credentials', async () => {
      const proxyUrl = 'http://testuser:testpass@127.0.0.1:9999'

      const proxiedFetchFn = createProxiedFetch(proxyUrl)
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

    it('should work with different input types when no proxy issues', async () => {
      // Create a fetch function with non-existent proxy for testing input types handling
      const fetchWithProxy = createFetchWithProxy()
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`

      // Test without proxy (should work)
      const response1 = await fetchWithProxy(targetUrl)
      expect(response1.ok).toBe(true)

      const response2 = await fetchWithProxy(new URL(targetUrl))
      expect(response2.ok).toBe(true)

      const response3 = await fetchWithProxy(new Request(targetUrl))
      expect(response3.ok).toBe(true)
    })
  })

  describe('proxiedFetch', () => {
    it('should be the default exported instance', () => {
      expect(typeof proxiedFetch).toBe('function')
    })
  })

  describe('cross-realm Request handling', () => {
    it('should handle Request objects with undici fetch to avoid cross-realm issues', async () => {
      // Import undici's fetch to simulate the cross-realm issue
      const { fetch: undiciFetch } = await import('undici')
      const fetchWithProxy = createFetchWithProxy(undiciFetch)
      
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`
      
      // Create a global Request object
      const request = new Request(targetUrl, {
        method: 'GET',
        headers: { 'X-Test': 'cross-realm' }
      })
      
      // This should not throw "Failed to parse URL from [object Request]"
      const response = await fetchWithProxy(request)
      expect(response.ok).toBe(true)
      
      const text = await response.text()
      expect(text).toBe('SUCCESS_FROM_BUN_CONTAINER')
    })

    it('should properly merge Request properties with init options', async () => {
      const { fetch: undiciFetch } = await import('undici')
      const fetchWithProxy = createFetchWithProxy(undiciFetch)
      
      const targetUrl = `http://${targetContainer.getHost()}:${targetContainer.getMappedPort(3000)}/success`
      
      // Create a Request with some properties
      const request = new Request(targetUrl, {
        method: 'POST',
        headers: { 'X-Request': 'from-request' }
      })
      
      // Override some properties in init (should take precedence)
      const response = await fetchWithProxy(request, {
        method: 'GET', // This should override the POST from Request
        headers: { 'X-Init': 'from-init' } // This should be added
      })
      
      expect(response.ok).toBe(true)
    })
  })
})
