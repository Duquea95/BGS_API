const mongoose = require('mongoose');
const UserAgreementSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    user_agreement_to_terms_and_condition: {
        type: Boolean,
        required: true 
    }
},{ timestamps: true });

  
module.exports = mongoose.model('UserAgreement', UserAgreementSchema)