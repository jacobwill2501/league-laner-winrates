const { Router } = require('express');
const router = Router();
router.get('/', (_req, res) => res.json({ stub: true }));
module.exports = router;
