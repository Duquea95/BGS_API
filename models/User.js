const { Decimal128 } = require('bson');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    address: {
        street: String,
        aptUnit: String,
        city: String,
        state: String,
        zipCode: String
    },
    isVerified: { type: Boolean, default: false },
},{timestamps: true})

module.exports = mongoose.model('User', userSchema)