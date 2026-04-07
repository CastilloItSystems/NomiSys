import prisma from './prisma.service.js'

const tenantModels = new Set([
  'brand',
  'category',
  'unit',
  'model',
  'warehouse',
  'item',
  'supplier',
  'customer',
  'order',
  'preInvoice',
  'invoice',
])

const addCompanyFilter = (args: any, companyId: string) => {
  if (!args.where) args.where = {}
  args.where = { AND: [args.where, { companyId }] }
}

/**
 * Creates an extended Prisma instance that auto-injects companyId
 * into all queries for anchor models.
 *
 * Note: findUnique/update/delete are not protected with AND because they
 * expect WhereUniqueInput. For those methods, validate companyId beforehand.
 */
export function createTenantPrisma(
  companyId: string
): ReturnType<typeof prisma.$extends> {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }: any) {
          if (tenantModels.has(model)) addCompanyFilter(args, companyId)
          return query(args)
        },

        async findFirst({ model, args, query }: any) {
          if (tenantModels.has(model)) addCompanyFilter(args, companyId)
          return query(args)
        },

        async count({ model, args, query }: any) {
          if (tenantModels.has(model)) addCompanyFilter(args, companyId)
          return query(args)
        },

        async aggregate({ model, args, query }: any) {
          if (tenantModels.has(model)) addCompanyFilter(args, companyId)
          return query(args)
        },

        async groupBy({ model, args, query }: any) {
          if (tenantModels.has(model)) addCompanyFilter(args, companyId)
          return query(args)
        },

        async create({ model, args, query }: any) {
          if (tenantModels.has(model)) {
            args.data = { ...args.data, companyId }
          }
          return query(args)
        },

        // async createMany({ model, args, query }: any) {
        //   if (tenantModels.has(model) && Array.isArray(args.data)) {
        //     args.data = args.data.map((item: any) => ({ ...item, empresaId }))
        //   }
        //   return query(args)
        // },
        async createMany({ model, args, query }: any) {
          if (tenantModels.has(model)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({ ...item, companyId }))
            } else if (args.data && typeof args.data === 'object') {
              args.data = { ...args.data, companyId }
            }
          }
          return query(args)
        },

        // findUnique no se toca (espera WhereUniqueInput)
        async findUnique({ args, query }: any) {
          return query(args)
        },

        // update/delete por unique tampoco se tocan
        async update({ args, query }: any) {
          return query(args)
        },

        async delete({ args, query }: any) {
          return query(args)
        },

        // updateMany/deleteMany can also be filtered
        async updateMany({ model, args, query }: any) {
          if (tenantModels.has(model)) addCompanyFilter(args, companyId)
          return query(args)
        },

        async deleteMany({ model, args, query }: any) {
          if (tenantModels.has(model)) addCompanyFilter(args, companyId)
          return query(args)
        },
      },
    },
  })
}

export default createTenantPrisma
