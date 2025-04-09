const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  images: [String], // URLs for item images
},{timestamps: true});

  
module.exports = mongoose.model('Item', ItemSchema)