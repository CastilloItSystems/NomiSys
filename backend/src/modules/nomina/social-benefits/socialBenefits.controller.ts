import { Request, Response } from 'express'
import socialBenefitsService from './socialBenefits.service.js'

export class SocialBenefitsController {
  async create(req: Request, res: Response) {
    try {
      const companyId = (req as any).companyId as string
      const userId = (req as any).userId as string
      const record = await socialBenefitsService.create(
        companyId,
        req.body,
        userId
      )
      res.status(201).json(record)
    } catch (err: any) {
      res.status(400).json({ message: err.message })
    }
  }

  async accrueQuarter(req: Request, res: Response) {
    try {
      const companyId = (req as any).companyId as string
      const userId = (req as any).userId as string
      const { year, quarter } = req.body
      if (!year || !quarter) {
        res.status(400).json({ message: 'year y quarter son requeridos' })
        return
      }
      const result = await socialBenefitsService.accrueQuarter(
        companyId,
        Number(year),
        Number(quarter),
        userId
      )
      res.json(result)
    } catch (err: any) {
      res.status(400).json({ message: err.message })
    }
  }

  async list(req: Request, res: Response) {
    try {
      const companyId = (req as any).companyId as string
      const { employeeId, year, quarter, status, limit, offset } = req.query
      const result = await socialBenefitsService.list(
        companyId,
        {
          employeeId: typeof employeeId === 'string' ? employeeId : undefined,
          year: typeof year === 'string' ? Number(year) : undefined,
          quarter: typeof quarter === 'string' ? Number(quarter) : undefined,
          status: typeof status === 'string' ? status : undefined,
        },
        {
          limit: typeof limit === 'string' ? Number(limit) : undefined,
          offset: typeof offset === 'string' ? Number(offset) : undefined,
        }
      )
      res.json(result)
    } catch (err: any) {
      res.status(500).json({ message: err.message })
    }
  }

  async getByEmployee(req: Request, res: Response) {
    try {
      const companyId = (req as any).companyId as string
      const employeeId = req.params['employeeId'] as string
      const result = await socialBenefitsService.getByEmployee(
        companyId,
        employeeId
      )
      res.json(result)
    } catch (err: any) {
      res.status(500).json({ message: err.message })
    }
  }
}

export default new SocialBenefitsController()
