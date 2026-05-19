import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware.js'
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js'
import { authorize } from '../../../shared/middleware/authorize.middleware.js'
import { extractCompany } from '../../../shared/middleware/company.middleware.js'
import { validateRequest } from '../../../shared/middleware/validateRequest.middleware.js'
import {
  createSalaryConcept,
  listSalaryConcepts,
  getSalaryConcept,
  updateSalaryConcept,
  deleteSalaryConcept,
  validateConceptFormula,
  getAvailableVariables,
  seedCCPConcepts,
} from './salaryConcepts.controller.js'
import {
  createSalaryConceptSchema,
  updateSalaryConceptSchema,
  listSalaryConceptsSchema,
} from './salaryConcepts.validation.js'

const router = Router()
const auth = [authenticate, extractCompany]

// Formula validation — available to anyone who can view/create concepts
router.post(
  '/validate-formula',
  auth,
  authorize('salaryConcepts.view'),
  asyncHandler(validateConceptFormula)
)

// Available variables for formula editor
router.get(
  '/variables/available',
  auth,
  authorize('salaryConcepts.view'),
  asyncHandler(getAvailableVariables)
)

// Seed CCP (Contrato Colectivo Petrolero) concepts
router.post(
  '/seed-ccp',
  auth,
  authorize('salaryConcepts.create'),
  asyncHandler(seedCCPConcepts)
)

router.post(
  '/',
  auth,
  authorize('salaryConcepts.create'),
  validateRequest(createSalaryConceptSchema, 'body'),
  asyncHandler(createSalaryConcept)
)
router.get(
  '/',
  auth,
  authorize('salaryConcepts.view'),
  validateRequest(listSalaryConceptsSchema, 'query'),
  asyncHandler(listSalaryConcepts)
)
router.get(
  '/:id',
  auth,
  authorize('salaryConcepts.view'),
  asyncHandler(getSalaryConcept)
)
router.put(
  '/:id',
  auth,
  authorize('salaryConcepts.update'),
  validateRequest(updateSalaryConceptSchema, 'body'),
  asyncHandler(updateSalaryConcept)
)
router.delete(
  '/:id',
  auth,
  authorize('salaryConcepts.delete'),
  asyncHandler(deleteSalaryConcept)
)

export default router
