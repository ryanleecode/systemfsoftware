#!/usr/bin/env bun

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rollupDir = join(__dirname, '..', 'dist', 'rollup')
const virtualReference = '/// <reference path="../../virtual.d.ts" />\r\n\r\n'

try {
  const files = readdirSync(rollupDir)
  const dtsFiles = files.filter((file) => file.endsWith('.d.ts'))

  console.log(`Adding virtual references to ${dtsFiles.length} rollup files...`)

  for (const file of dtsFiles) {
    const filePath = join(rollupDir, file)
    const content = readFileSync(filePath, 'utf8')

    // Check if the virtual reference is already present
    if (!content.startsWith('/// <reference path="../../virtual.d.ts"')) {
      const newContent = virtualReference + content
      writeFileSync(filePath, newContent, 'utf8')
      console.log(`✓ Added virtual reference to ${file}`)
    } else {
      console.log(`⚠ Virtual reference already exists in ${file}`)
    }
  }

  console.log('✅ Virtual references added successfully!')
} catch (error) {
  console.error('❌ Error adding virtual references:', (error as Error).message)
  process.exit(1)
}
