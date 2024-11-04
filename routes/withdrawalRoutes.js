const express = require('express')
const { getWithdrawalsForAdmin, approveWithdrawal } = require('../controllers/withdrawalController')
const router = express.Router()

router.route('/:id')
    .get(getWithdrawalsForAdmin)

router.route('/:id/approveWithdrawal')
    .post(approveWithdrawal)
    // .delete()


module.exports = router