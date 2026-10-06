const router = require('express').Router();
const c = require('../controllers/UsersController');
const v = require('../middleware/validators');
const { requireRole } = require('../middleware/auth');

router.use(requireRole('admin'));   // весь раздел пользователей - только для администратора


router.get('/', c.getAll);
router.post('/', v.userCreate, v.check, c.create);
router.put('/:id', v.userUpdate, v.check, c.update);
router.delete('/:id', v.idOnly, v.check, c.remove);
module.exports = router;
