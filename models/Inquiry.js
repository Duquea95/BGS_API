const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    insuranceValue: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Evaluated', 'Offer Sent', 'Sold'],
        default: 'Pending' 
    },
    offerAmount: { // Offer made by your business
        type: Number,
        default: 0
    },
    purchasedPrice: { // Final agreed sale price
        type: Number,
        default: 0,
    }, 
    labelType: { // Shipping label
        type: String,
        enum: ['FedEx', 'USPS'], 
        default: 'FedEx'
    }, 
    shipmentTrackingNumber: {
        type: String,
        default: ''
    },
}, {timestamps: true})
  
  module.exports = mongoose.model('Inquiry', inquirySchema)