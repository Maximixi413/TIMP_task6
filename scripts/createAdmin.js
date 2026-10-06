// Создание администратора. Укажите ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD в .env и выполните: npm run create-admin
// Роль admin нельзя получить через API, только этим скриптом (по умолчанию все новые пользователи - customer).
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) { console.error('Задайте ADMIN_EMAIL и ADMIN_PASSWORD в .env'); process.exit(1); }
  await connectDB();
  let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (user) { user.role = 'admin'; user.password = ADMIN_PASSWORD; }
  else user = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
  await user.save();
  console.log('Администратор готов:', user.email);
  await mongoose.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
