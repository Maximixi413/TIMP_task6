// Точка входа: настройка Express, middleware безопасности, маршрутов и БД.
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { attachUser } = require('./middleware/auth');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Задайте JWT_SECRET (не короче 32 символов) в .env');
  process.exit(1);
}

const app = express();

app.set('view engine', 'ejs');                    // View: шаблонизатор EJS
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(express.static(path.join(__dirname, 'public'))); // CSS, изображения                                // защитные HTTP-заголовки (CSP и др.)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // защита от перебора/DoS
app.use(express.json({ limit: '10kb' }));         // ограничение размера тела запроса
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());                         // защита от NoSQL-инъекций ($ и .)
app.use(methodOverride('_method'));               // PUT/DELETE из HTML-форм (?_method=PUT)
app.use(attachUser);                              // текущий пользователь из JWT -> req.user, res.locals.user

app.get('/', (req, res) => res.render('index'));
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));

// 404 и централизованная обработка ошибок (без утечки stack trace клиенту)
app.use((req, res) => res.status(404).json({ error: 'Не найдено' }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : 500;
  const msg = status === 409 ? 'Запись уже существует' : status === 400 ? err.message : 'Внутренняя ошибка сервера';
  res.status(status).json({ error: msg });
});

const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`http://localhost:${PORT}`)))
  .catch(e => { console.error('Ошибка подключения к MongoDB:', e.message); process.exit(1); });

module.exports = app;
