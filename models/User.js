const { Decimal128 } = require('bson');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    address: {
        street: String,
        address2: String,
        city: String,
        state: String,
        zipCode: String
    },
    inquiries: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Inquiry', 
        // required: true
    }],
    isVerified: { type: Boolean, default: false },
    userAgreement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAgreement'
    }
    
},{timestamps: true})

module.exports = mongoose.model('User', userSchema)