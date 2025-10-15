import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import catalogRoutes from '../modules/catalog/catalog.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);

export default router;
