const Analytic = require("../models/WithdrawalRequest")
const User = require("../models/User")

const getStore = async(req, res) => {
    // const store = await Analytic.findById('658bcd1fca0b82fca8c8420c')
    // const users = await User.find()

    res.status(200).json({
        // users: users,
        // store: store, 
    })
}

const addUser = async(req, res) => {}
// const deleteUser = async(req, res) => {}

module.exports = {
    getStore,
}