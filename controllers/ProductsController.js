// Controller: CRUD товаров.
const Product = require('../models/Product');
const html = req => req.accepts(['json', 'html']) === 'html';
const pick = b => Object.fromEntries(['title', 'description', 'price', 'stock'].filter(k => b[k] !== undefined).map(k => [k, b[k]]));

exports.getAll = async (req, res, next) => {          // GET /products
  try {
    const products = await Product.find().lean();
    html(req) ? res.render('productList', { products }) : res.json(products);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {          // POST /products
  try {
    const p = await Product.create(pick(req.body));
    html(req) ? res.redirect('/products') : res.status(201).json(p);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {          // PUT /products/:id
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!p) return res.status(404).json({ error: 'Товар не найден' });
    html(req) ? res.redirect('/products') : res.json(p);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {          // DELETE /products/:id
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Товар не найден' });
    html(req) ? res.redirect('/products') : res.status(204).end();
  } catch (e) { next(e); }
};
