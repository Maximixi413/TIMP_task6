// Model: пользователь. Бизнес-правила и валидация данных на уровне схемы.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false }, // не возвращается в запросах
  role:     { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });

// Пароль хранится только в виде bcrypt-хеша
userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);
