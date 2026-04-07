import swaggerJsdoc from 'swagger-jsdoc'
import path from 'path'
import { fileURLToPath } from 'url'

// Para obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NomiSys API',
      version: '1.0.0',
      description:
        'Documentación oficial de la API NomiSys - Sistema de Gestión Integral',
      contact: {
        name: 'NomiSys Support',
        email: 'support@nomisys.com',
      },
      license: {
        name: 'Proprietary',
        url: 'https://nomisys.com/license',
      },
    },
    servers: [
      {
        url: `${process.env.API_BASE_URL || 'http://localhost:4000'}/api`,
        description:
          process.env.NODE_ENV === 'production'
            ? 'Production Server'
            : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT token for authentication. Include in Authorization header as: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 400,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
              example: 'Success message',
            },
            data: {
              type: 'object',
            },
          },
        },
        UserCreateRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'empresaId'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: { type: 'string', example: 'secret' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            empresaId: { type: 'string', format: 'uuid' },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isActive: { type: 'boolean' },
            empresaId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EmpresaCreateRequest: {
          type: 'object',
          required: ['name', 'ruc'],
          properties: {
            name: { type: 'string', example: 'Mi Empresa' },
            ruc: { type: 'string', example: 'J-12345678-9' },
            address: { type: 'string' },
          },
        },
        EmpresaResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            ruc: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PermissionResponse: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        CompanyRoleResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            permissions: {
              type: 'array',
              items: { $ref: '#/components/schemas/PermissionResponse' },
            },
          },
        },
        MembershipResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            empresaId: { type: 'string', format: 'uuid' },
            roleId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // Archivos a scanear para comentarios JSDoc
  apis: [
    path.resolve(__dirname, '../controllers/**/*.ts'),
    path.resolve(__dirname, '../routes/**/*.ts'),
  ],
}

// Debug: mostrar dónde está buscando
console.log('🔍 Swagger buscando archivos en:')
options.apis.forEach((apiPath) => {
  console.log(`   - ${apiPath}`)
})

export const swaggerSpec = swaggerJsdoc(options) as Record<string, any>
console.log(
  `✅ Swagger spec generado con ${Object.keys(swaggerSpec.paths || {}).length} endpoints`
)
