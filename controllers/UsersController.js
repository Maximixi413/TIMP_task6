// Controller: CRUD пользователей. Браузеру отдаёт HTML (EJS), Postman — JSON.
const User = require('../models/User');
const html = req => req.accepts(['json', 'html']) === 'html';

// Белый список полей защищает от mass assignment (role нельзя задать извне)
const pick = b => Object.fromEntries(['name', 'email', 'password'].filter(k => b[k] !== undefined).map(k => [k, b[k]]));
const safe = u => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

exports.getAll = async (req, res, next) => {          // GET /users
  try {
    const users = await User.find().lean();
    html(req) ? res.render('userForm', { users }) : res.json(users);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {          // POST /users
  try {
    const user = await User.create(pick(req.body));
    html(req) ? res.redirect('/users') : res.status(201).json(safe(user));
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {          // PUT /users/:id
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    Object.assign(user, pick(req.body));
    await user.save();                                  // save() запускает хеширование пароля
    html(req) ? res.redirect('/users') : res.json(safe(user));
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {          // DELETE /users/:id
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    html(req) ? res.redirect('/users') : res.status(204).end();
  } catch (e) { next(e); }
};
