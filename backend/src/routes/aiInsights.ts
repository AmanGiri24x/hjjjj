import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ success: false, message: 'AI insights routes under construction' }));
export default router;
