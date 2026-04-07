// backend/src/types/jwt.types.ts

export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface JwtVerifiedPayload extends JwtPayload {
  iat: number
  exp: number
}
