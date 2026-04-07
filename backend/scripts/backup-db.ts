// backend/scripts/backup-db.ts
// Creates a compressed pg_dump backup and writes it to ./backups/
// Usage: tsx scripts/backup-db.ts
//   Optionally set BACKUP_DIR env var to override the output directory.

import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const backupsDir =
  process.env.BACKUP_DIR ?? path.join(__dirname, '..', 'backups')

const main = (): void => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is not set.')
    process.exit(1)
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${timestamp}.sql.gz`
  const outputPath = path.join(backupsDir, filename)

  console.log(`Starting backup → ${outputPath}`)

  try {
    // pg_dump outputs to stdout; gzip compresses it to the output file
    execSync(`pg_dump "${databaseUrl}" | gzip > "${outputPath}"`, {
      stdio: ['inherit', 'inherit', 'inherit'],
      shell: '/bin/sh',
    })

    const stats = fs.statSync(outputPath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`Backup completed: ${filename} (${sizeMB} MB)`)
  } catch (error) {
    console.error(
      'Backup failed:',
      error instanceof Error ? error.message : error
    )
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    process.exit(1)
  }
}

main()
