const express = require('express')
const { createInquiry, getInquiries, postFile} = require('../controllers/inquiryController')
const router = express.Router()

router.route('/')
    .get(getInquiries)
    // .post(postFile)
    .post(createInquiry)

module.exports = router