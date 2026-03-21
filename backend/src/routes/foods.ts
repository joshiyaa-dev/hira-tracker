import { Router, Request, Response } from 'express';

const router = Router();

// Search foods
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    // TODO: Implement food database search
    const foods = [];
    res.json({ success: true, data: foods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
