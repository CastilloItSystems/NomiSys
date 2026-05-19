import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createContractType,
  listContractTypes,
  getContractType,
  updateContractType,
  deleteContractType,
} from './contractTypes.controller.js'
import {
  createContractTypeSchema,
  updateContractTypeSchema,
  listContractTypesSchema,
} from './contractTypes.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

router.post(
  '/',
  auth,
  authorize('contractTypes.create'),
  validateRequest(createContractTypeSchema, 'body'),
  asyncHandler(createContractType)
)
router.get(
  '/',
  auth,
  authorize('contractTypes.view'),
  validateRequest(listContractTypesSchema, 'query'),
  asyncHandler(listContractTypes)
)
router.get(
  '/:id',
  auth,
  authorize('contractTypes.view'),
  asyncHandler(getContractType)
)
router.put(
  '/:id',
  auth,
  authorize('contractTypes.update'),
  validateRequest(updateContractTypeSchema, 'body'),
  asyncHandler(updateContractType)
)
router.delete(
  '/:id',
  auth,
  authorize('contractTypes.delete'),
  asyncHandler(deleteContractType)
)

export default router
