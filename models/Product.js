// Model: товар каталога.
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  price:       { type: Number, required: true, min: 0 },
  stock:       { type: Number, default: 0, min: 0, validate: Number.isInteger }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
