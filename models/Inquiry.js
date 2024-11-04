const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    itemId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item',
        required: true 
    },
    status: {
        type: String,
        enum: ['Pending', 'Evaluated', 'Offer Sent', 'Sold'],
        default: 'Pending' 
    },
    offerAmount: { // Offer made by your business
        type: Number 
    },
    salePrice: { // Final agreed sale price
        type: Number 
    }, 
    labelType: { // Shipping label
        type: String,
        enum: ['FedEx', 'USPS'], 
        required: true 
    }, 
    shipmentTrackingNumber: {
        type: String 
    },
}, {timestamps: true})
  
  module.exports = mongoose.model('Inquiry', inquirySchema)