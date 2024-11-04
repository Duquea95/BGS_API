const express = require('express')
const { addTransaction, getTransactions, addTransactionByID } = require('../controllers/transactionsController')
const router = express.Router()

router.route('/')
    .get(getTransactions)
    .post(addTransaction)

router.route('/:id/addTransaction')
    .post(addTransactionByID)

module.exports = router