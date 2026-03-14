import { Router } from 'express'
import { getAll, getOne, getDeliveries } from '../controllers/jobs.controller'

const router = Router()

router.get('/', getAll)
router.get('/:id', getOne)
router.get('/:id/deliveries', getDeliveries)

export default router
