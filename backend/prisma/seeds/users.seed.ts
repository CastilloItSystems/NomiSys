import type { PrismaClient } from '../../src/generated/prisma/client.js'
import bcrypt from 'bcryptjs'

export default async function seedUsers(prisma: PrismaClient) {
  try {
    const adminPassword = await bcrypt.hash('admin123', 10)
    const userPassword = await bcrypt.hash('user123', 10)

    const users = [
      {
        name: 'Owner User',
        email: 'owner@test.com',
        password: adminPassword,
        status: 'active',
        departments: ['administration', 'inventory', 'sales'],
        access: 'full',
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: adminPassword,
        status: 'active',
        departments: ['administration', 'inventory'],
        access: 'full',
      },
      {
        name: 'Gerente User',
        email: 'gerente@test.com',
        password: userPassword,
        status: 'active',
        departments: ['sales', 'inventory'],
        access: 'full',
      },
      {
        name: 'Vendedor User',
        email: 'vendedor@test.com',
        password: userPassword,
        status: 'active',
        departments: ['sales'],
        access: 'limited',
      },
      {
        name: 'Almacenista User',
        email: 'almacenista@test.com',
        password: userPassword,
        status: 'active',
        departments: ['inventory'],
        access: 'limited',
      },
      {
        name: 'Viewer User',
        email: 'viewer@test.com',
        password: userPassword,
        status: 'active',
        departments: [],
        access: 'none',
      },
    ] as const

    for (const user of users) {
      const created = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: user.password,
          status: user.status as any,
          departments: [...user.departments],
          access: user.access as any,
          deleted: false,
        },
        create: {
          name: user.name,
          email: user.email,
          password: user.password,
          status: user.status as any,
          departments: [...user.departments],
          access: user.access as any,
          deleted: false,
        },
      })

      console.log(`✅ User created: ${created.email}`)
    }

    console.log('✅ All users seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }
}
