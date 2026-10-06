const router = require('express').Router();
const c = require('../controllers/ProductsController');
const v = require('../middleware/validators');
const { requireRole } = require('../middleware/auth');
const admin = requireRole('admin');

router.get('/', c.getAll);   // каталог доступен всем; изменения - только admin
router.post('/', admin, v.productCreate, v.check, c.create);
router.put('/:id', admin, v.productUpdate, v.check, c.update);
router.delete('/:id', admin, v.idOnly, v.check, c.remove);
module.exports = router;
