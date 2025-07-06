import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsup'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))
const dependencies = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
]

export default defineConfig({
  entry: ['src/index.ts', 'src/client.ts', 'src/server.ts', 'src/config.ts'],
  format: ['esm'],
  target: 'es2022',
  bundle: true,
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  external: [...dependencies, './virtual.d.ts', 'auth:config', 'lightningcss', '*.astro'],
  treeshake: 'smallest',
  tsconfig: 'tsconfig.build.json',
})
