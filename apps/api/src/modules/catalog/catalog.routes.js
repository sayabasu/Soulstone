import { Router } from 'express';

import { index, show } from './catalog.controller.js';

const router = Router();

router.get('/products', index);
router.get('/products/:id', show);

export default router;
