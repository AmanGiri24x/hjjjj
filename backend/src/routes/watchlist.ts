import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ success: false, message: 'Watchlist routes under construction' }));
export default router;
