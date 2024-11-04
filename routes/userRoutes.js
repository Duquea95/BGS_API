const express = require('express')
const router = express.Router()
const {getUsers, createUser, deleteUser, getUserProfile, updateActiveState, csvUpdate, updateInvestment, updateUserInfo, userUpdateAccountInfo, resetPassword} = require('../controllers/usersController')
const { requestWithdrawal } = require('../controllers/withdrawalController')

router.route('/')
    .get(getUsers)
    .post(createUser)
    .delete()

router.route('/csvUpdate')
    .patch(csvUpdate)

router.route('/:id')
    .get(getUserProfile)

router.route('/:id/activation')
    .post(updateActiveState)

router.route('/:id/updateInvestment')
    .patch(updateInvestment)

router.route('/:id/updateUserInfo')
    .patch(updateUserInfo)

router.route('/:id/requestWithdrawal')
    .post(requestWithdrawal)

router.route('/:id/resetPassword')
    .put(resetPassword)

module.exports = router