import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsup'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))
const dependencies = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
]
const devDependencies = [...Object.keys(packageJson.devDependencies || {})]

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm'],
  target: 'es2022',
  bundle: false,
  dts: {
    entry: ['src/index.ts', 'src/client.ts', 'src/server.ts'],
    banner: '/// <reference path="../virtual.d.ts" />\n',
  },
  sourcemap: false,
  clean: true,
  splitting: true,
  minify: false,
  external: [...dependencies, './virtual.d.ts'],
  noExternal: devDependencies,
  treeshake: 'smallest',
  tsconfig: 'tsconfig.build.json',
})
