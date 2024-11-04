const express = require('express')
const router = express.Router()
const {getAnalytics, 
    // addAnalytic, deleteAnalytic
} = require('../controllers/reportController')

router.route('/')
    .get(getAnalytics)
    // .post(addAnalytic)
    // .delete()


module.exports = router