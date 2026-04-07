// backend/src/shared/interfaces/IController.ts
import { Request, Response, NextFunction } from 'express'

export interface IController {
  getAll?(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response>
  getById?(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response>
  create?(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response>
  update?(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response>
  delete?(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response>
}
