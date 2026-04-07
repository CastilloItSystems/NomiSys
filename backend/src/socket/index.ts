import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HTTPServer } from 'http'
import jwt from 'jsonwebtoken'
import { corsConfig } from '../config/cors.config.js'
import { logger } from '../shared/utils/logger.js'
import type {
  StockUpdatePayload,
  LowStockPayload,
  NewOrderPayload,
  PaymentPayload,
  NotificationPayload,
} from '../shared/types/event.types.js'

let io: SocketIOServer

// ==============================
// Types
// ==============================
interface AuthPayload {
  sub: string // userId
  companyId?: string
  role?: string
}

interface SocketData {
  userId: string
  companyId?: string
  role?: string
}

// ==============================
// Helpers
// ==============================
const getTokenFromSocket = (socket: Socket): string | null => {
  const authToken = socket.handshake.auth?.token
  if (typeof authToken === 'string' && authToken.trim()) return authToken.trim()

  const authHeader = socket.handshake.headers.authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }

  return null
}

const hasRole = (
  socket: Socket<any, any, any, SocketData>,
  roles: string[]
): boolean => {
  return socket.data.role ? roles.includes(socket.data.role) : false
}

// Restringe rooms arbitrarias para evitar abuso
const isAllowedRoom = (
  socket: Socket<any, any, any, SocketData>,
  roomId: string
): boolean => {
  if (!roomId || typeof roomId !== 'string') return false

  // Can join own user room
  if (roomId === `user-${socket.data.userId}`) return true

  // Can join company room
  if (socket.data.companyId && roomId === `company-${socket.data.companyId}`) {
    return true
  }

  // Permitir salas funcionales controladas (ej: sales-*, inventory-*)
  if (roomId.startsWith('sales-') || roomId.startsWith('inventory-')) {
    return true
  }

  return false
}

// ==============================
// Type guards mínimos
// ==============================
const isStockUpdatePayload = (data: unknown): data is StockUpdatePayload =>
  !!data &&
  typeof data === 'object' &&
  typeof (data as StockUpdatePayload).productId === 'string' &&
  typeof (data as StockUpdatePayload).stock === 'number' &&
  typeof (data as StockUpdatePayload).companyId === 'string'

const isLowStockPayload = (data: unknown): data is LowStockPayload =>
  !!data &&
  typeof data === 'object' &&
  typeof (data as LowStockPayload).productId === 'string' &&
  typeof (data as LowStockPayload).currentStock === 'number' &&
  typeof (data as LowStockPayload).threshold === 'number' &&
  typeof (data as LowStockPayload).companyId === 'string'

const isNewOrderPayload = (data: unknown): data is NewOrderPayload =>
  !!data &&
  typeof data === 'object' &&
  typeof (data as NewOrderPayload).orderId === 'string' &&
  typeof (data as NewOrderPayload).total === 'number' &&
  typeof (data as NewOrderPayload).companyId === 'string'

const isPaymentPayload = (data: unknown): data is PaymentPayload =>
  !!data &&
  typeof data === 'object' &&
  typeof (data as PaymentPayload).orderId === 'string' &&
  typeof (data as PaymentPayload).amount === 'number' &&
  typeof (data as PaymentPayload).companyId === 'string'

const isNotificationPayload = (data: unknown): data is NotificationPayload =>
  !!data &&
  typeof data === 'object' &&
  typeof (data as NotificationPayload).userId === 'string' &&
  !!(data as NotificationPayload).notification &&
  typeof (data as NotificationPayload).notification.title === 'string' &&
  typeof (data as NotificationPayload).notification.message === 'string'

// ==============================
// Init
// ==============================
export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: corsConfig.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Middleware de autenticación
  io.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket)
      if (!token) return next(new Error('Unauthorized: token requerido'))

      const secret = process.env.JWT_SECRET
      if (!secret) {
        return next(new Error('Server misconfigured: JWT_SECRET faltante'))
      }

      const payload = jwt.verify(token, secret) as AuthPayload
      socket.data.userId = payload.sub
      socket.data.companyId = payload.companyId
      socket.data.role = payload.role

      return next()
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      return next(new Error(`Unauthorized: ${err.message}`))
    }
  })

  io.on('connection', (socket: Socket<any, any, any, SocketData>) => {
    logger.info('Socket.IO: User connected', {
      socketId: socket.id,
      userId: socket.data.userId,
      companyId: socket.data.companyId,
    })

    // Auto-join base rooms
    socket.join(`user-${socket.data.userId}`)
    if (socket.data.companyId) {
      socket.join(`company-${socket.data.companyId}`)
    }

    socket.on('join-room', (roomId: string) => {
      if (!isAllowedRoom(socket, roomId)) {
        logger.warn('Socket.IO: intento de join-room no permitido', {
          socketId: socket.id,
          userId: socket.data.userId,
          roomId,
        })
        return
      }

      socket.join(roomId)
      logger.info('Socket.IO: Usuario se unió a sala', {
        socketId: socket.id,
        roomId,
      })

      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('leave-room', (roomId: string) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.leave(roomId)

      logger.info('Socket.IO: Usuario salió de sala', {
        socketId: socket.id,
        roomId,
      })

      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      })
    })

    // INVENTORY
    socket.on('inventory:stock-update', (data: unknown) => {
      if (!isStockUpdatePayload(data)) return
      if (!hasRole(socket, ['ADMIN', 'MANAGER'])) return
      if (socket.data.companyId && socket.data.companyId !== data.companyId)
        return

      logger.info('Socket.IO: Stock update', {
        productId: data.productId,
        companyId: data.companyId,
      })

      io.to(`company-${data.companyId}`).emit('inventory:stock-updated', data)
    })

    socket.on('inventory:low-stock-alert', (data: unknown) => {
      if (!isLowStockPayload(data)) return
      if (!hasRole(socket, ['ADMIN', 'MANAGER', 'SELLER'])) return
      if (socket.data.companyId && socket.data.companyId !== data.companyId)
        return

      logger.warn('Socket.IO: Low stock alert', {
        productId: data.productId,
        companyId: data.companyId,
      })

      io.to(`company-${data.companyId}`).emit('inventory:alert', {
        type: 'LOW_STOCK',
        ...data,
        timestamp: new Date().toISOString(),
      })
    })

    // SALES
    socket.on('sales:new-order', (data: unknown) => {
      if (!isNewOrderPayload(data)) return
      if (!hasRole(socket, ['ADMIN', 'MANAGER', 'SELLER'])) return
      if (socket.data.companyId && socket.data.companyId !== data.companyId)
        return

      logger.info('Socket.IO: New sales order', {
        orderId: data.orderId,
        companyId: data.companyId,
      })

      io.to(`company-${data.companyId}`).emit('sales:order-created', data)
    })

    socket.on('sales:payment-received', (data: unknown) => {
      if (!isPaymentPayload(data)) return
      if (!hasRole(socket, ['ADMIN', 'MANAGER', 'CASHIER'])) return
      if (socket.data.companyId && socket.data.companyId !== data.companyId)
        return

      logger.info('Socket.IO: Payment received', {
        orderId: data.orderId,
        companyId: data.companyId,
      })

      io.to(`company-${data.companyId}`).emit('sales:payment-processed', data)
    })

    // NOTIFICATIONS
    socket.on('notification:send', (data: unknown) => {
      if (!isNotificationPayload(data)) return
      if (!hasRole(socket, ['ADMIN', 'MANAGER'])) return

      io.to(`user-${data.userId}`).emit(
        'notification:received',
        data.notification
      )
    })

    socket.on('disconnect', (reason) => {
      logger.info('Socket.IO: User disconnected', {
        socketId: socket.id,
        userId: socket.data.userId,
        reason,
      })
    })

    socket.on('error', (error: Error) => {
      logger.error('Socket.IO: Error', {
        socketId: socket.id,
        userId: socket.data.userId,
        error: error.message,
      })
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io no ha sido inicializado')
  return io
}
