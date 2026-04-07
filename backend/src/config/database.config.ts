// backend/src/config/database.config.ts
// PostgreSQL connection pool configuration used by the Prisma pg adapter.

export const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT ?? '30000', 10),
    connectionTimeoutMillis: parseInt(
      process.env.DB_CONN_TIMEOUT ?? '5000',
      10
    ),
  },
} as const
