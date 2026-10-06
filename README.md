# shop-mvc

MVC-приложение интернет-магазина: Node.js, Express, EJS, MongoDB (Mongoose).

## Запуск
1. `npm install`
2. `cp .env.example .env` и заполните `JWT_SECRET` (не короче 32 символов), при необходимости `MONGO_URI`
3. Запустите MongoDB
4. Создайте администратора: укажите `ADMIN_EMAIL` и `ADMIN_PASSWORD` в `.env`, выполните `npm run create-admin`
5. `npm start` -> http://localhost:3000

## Структура
- `models/` - схемы Mongoose, бизнес-правила (User, Product)
- `views/` - EJS-шаблоны (index, login, productList, userForm, partials/nav)
- `controllers/` - обработка запросов (Auth, Users, Products)
- `routes/` - маршруты; `middleware/` - валидация и аутентификация/авторизация
- `config/db.js` - подключение к MongoDB; `public/` - статика; `scripts/` - служебные скрипты
- `app.js` - точка входа

## Аутентификация и права доступа
JWT (HS256, срок 1 час) хранится в httpOnly-cookie с `SameSite=Strict` (браузер) либо передаётся заголовком `Authorization: Bearer <token>` (Postman).

| Маршрут | Доступ |
|---|---|
| `POST /auth/register`, `POST /auth/login` | все (лимит 10 попыток / 15 мин) |
| `POST /auth/logout`, `GET /auth/me` | авторизованные |
| `GET /products` | все |
| `POST/PUT/DELETE /products` | admin |
| `/users` (все методы) | admin |

Регистрация всегда создаёт роль `customer`; `admin` назначается только скриптом `create-admin`.

## API (Postman)
1. `POST /auth/login` с `{"email":"...","password":"..."}` -> в ответе `token`
2. В остальных запросах заголовок `Authorization: Bearer <token>`
3. `POST /users` `{"name":"Ivan","email":"i@a.com","password":"12345678"}`; `PUT /users/:id`; `DELETE /users/:id`; `GET /users`
4. Аналогично `/products` (title, description, price, stock)

Браузер получает HTML, клиенты с `Accept: application/json` - JSON.

## Меры безопасности
JWT с явным алгоритмом и сроком жизни, httpOnly + SameSite=Strict cookie (защита от кражи токена через XSS и от CSRF), RBAC (customer/admin), единое сообщение об ошибке входа и фиктивное сравнение хеша (защита от перебора email и timing-атак), строгий rate limit на вход, helmet, ограничение размера тела, express-mongo-sanitize (NoSQL-инъекции), express-validator, bcrypt-хеширование паролей, пароль скрыт из выборок, белый список полей (mass assignment), экранирование вывода в EJS, обработчик ошибок без утечки деталей.
