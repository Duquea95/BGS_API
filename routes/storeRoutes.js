const express = require('express')
const router = express.Router()
const {getStore, 
} = require('../controllers/storeController')

router.route('/')
    .get(getStore)


module.exports = router