const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Gold', 'Diamond', 'Watch'], required: true },
  description: { type: String },
  gold: {
    type: String,
  },
  weight: { 
    type: Number,
  }, // for gold or diamonds
  carat: { type: Number }, // for diamonds and gold jewelry
  brand: { type: String }, // for watches
  reference: { type: String }, // e.g. New, Used, Excellent
  images: [String], // URLs for item images
},{timestamps: true});

  
module.exports = mongoose.model('Item', ItemSchema)