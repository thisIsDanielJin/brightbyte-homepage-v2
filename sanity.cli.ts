/**
 * sanity.cli.ts — Sanity CLI config (typegen, schema extract, dataset import).
 *
 * Minimal single-export config (mirrors postcss.config.mjs shape). projectId/dataset
 * from @/sanity/env so the CLI targets the same project as the app.
 *
 * Source: 03-PATTERNS.md sanity.cli.ts; defineCliConfig verified in sanity/cli.
 */
import { defineCliConfig } from 'sanity/cli'
import { projectId, dataset } from '@/sanity/env'

export default defineCliConfig({
  api: { projectId, dataset },
})
