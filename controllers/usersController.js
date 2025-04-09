const { sendEmail } = require("../features/mailer")
const Product = require("../models/Product")
const Report = require("../models/Report")
const TransactionSchema = require("../models/TransactionSchema")
const User = require("../models/User")
// const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const WithdrawalSchema = require("../models/WithdrawalSchema")

const getUserProfile = async (req, res) => {
    const user = await User.findById(req.params.id).lean().exec()
    
    let productArray = []
    if(!user) return res.status(400).json({error: 'No user found'})
    await Promise.all(
        user.investments.map(async (_id) => {
           // console.log(_id)
           let foundProduct = await Product.findOne({ _id: {$eq: _id} })

           if(foundProduct) productArray.push(foundProduct)
       }),
    )

    let totalBuy = 0, totalSell = 0

    let transactionArray = []
    if(user.role != 100){
        user.requestHistory = await WithdrawalSchema.find({
            requestedBy: user._id
        })
        
        transactionArray = await TransactionSchema.find({investor: user._id})
        user.transactions = transactionArray

        transactionArray.map((transaction) => {
            if(transaction.type == 'buy') totalBuy++
            else totalSell++
        })
        user.totalSale
    }

    user.investments = productArray
    user.totalBuy = totalBuy
    user.totalSell = totalSell
    
    res.status(200).json(user)
}

const getUsers = async(req, res) => {
    try{
        const users = await User.find().lean()
        
        const usersWithTransactions = await Promise.all(
            users.map(async (user)=> {
                const transactions = await TransactionSchema.find({investor: user._id}).lean()

                let buyCount = 0;
                let sellCount = 0;

                transactions.forEach(transaction => {
                    if (transaction.type === 'buy') {
                        buyCount++;
                    } else if (transaction.type === 'sell') {
                        sellCount++;
                    }
                });
                
                if (transactions.length === 0) {
                    // console.log('No transactions found for user:', user._id);
                }
                
                return { ...user, transactions, buyCount, sellCount};
            })
        )
        
        // console.log(usersWithTransactions)

        res.status(200).json(usersWithTransactions);
    } catch (error) {
        // console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const csvUpdate = async(req, res) => {
    
    let totalFunding = 0, initialInvestment = 0, userCount = 0;
    
    await Promise.all(
        req.body.map( async(csvUser)=>{
            const filter = { email: csvUser['Email'] }

            const updateDocument = { $set: {
                initialInvestment: csvUser['Initial Investment']
            }}
        
            const result = await User.updateOne(
                filter,
                updateDocument
            )
            
            if(result.matchedCount == 0) {
                const hashPwd = await bcrypt.hash('password', 10)
                let createdUser = await User.create({
                    email: csvUser['Email'],
                    password: hashPwd,
                    firstName: csvUser['First Name'],
                    lastName: csvUser['Last Name'],
                    initialInvestment: csvUser['Initial Investment'],
                    portfolioValue: csvUser['Initial Investment'],
                    cashOnHand: csvUser['Initial Investment'],
                })
                    
                let mail ={}
                mail.subject = 'Investor Watch - Account Activated!'
                mail.message = `Thank you for joining Investor Watch! Please use the link below to change your password and login to your account! http://localhost:3000/account/reset/${createdUser._id}`
                mail.html = `<p>Thank you for joining Investor Watch! Please use the link below to change your password and login to your account! <br/> <a href="http://localhost:3000/account/reset/${createdUser._id}">Reset Password</a></p>`
                await sendEmail( createdUser.email ,mail)

            }
            
            initialInvestment += Number( csvUser['Initial Investment'] )
            totalFunding += Number( csvUser['Initial Investment'] )
            userCount = userCount + 1
        })
    )
    const report = await Report.find().limit(1).sort({$natural:-1})
    if(!report){
        const reportResult = await Report.create({
            totalInvestors: userCount,
            initialInvestment,
            totalFunding,
            cashOnHand: totalFunding,
        })
    }else{
        console.log('running')
        console.log(report)
        await Report.findByIdAndUpdate(report[0]._id,{
            $inc: {
                totalInvestors: userCount,
                initialInvestment: initialInvestment,
                totalFunding: initialInvestment,
                cashOnHand: initialInvestment,
            }
        })
        // report.totalInvestors = report.totalInvestors + userCount
        // report.initialInvestment = report.initialInvestment + initialInvestment
        // report.totalFunding = report.totalFunding + initialInvestment
        // report.cashOnHand = report.cashOnHand + initialInvestment
    }

    const users = await User.find()
    res.status(200).json(users)
}

const createUser = async(req, res) => {
    const { email, password, firstName, lastName } = req.body
    // console.log(req.body)

    // Confirm username & password
    if( !email || !password, !firstName, !lastName){ 
        return res.status(400).json({ message: 'All fields required!' }
    )}
    
    // const {name, investment} = req.body
    // if(!name || !investment) res.status(402)
    let duplicate = await User.findOne({email: email.toLowerCase()}).lean().exec()

    if(duplicate) return res.status(400).json({ message: 'User Exists!' })

    // Hash Password
    const hashPwd = await bcrypt.hash(password, 10)

    const userObject = { email: email.toLowerCase(), password: hashPwd, firstName, lastName, }

    const user = await User.create(userObject)
    
    if(user){
        let mail ={}
        mail.subject = 'Investor Watch - Account Activated!'
        mail.message = `Thank you for joining Investor Watch! Your account has been activated.!`
        
        await sendEmail( user.email, mail )

        return res.status(201).json({message: `New user: ${email} created`})
    }else{
        return res.status(400).json({message: 'Invalid user received!'})
    }
}

const adjustPercentage = async(totalInvestments) => {
    let users = await User.find().then()

    new Promise( users.map( async(user) => {
        await User.findByIdAndUpdate(user._id, {
            percentage: (Number(user.investment) / totalInvestments) * 100
        })
        await user.save()
    }))
    // user.percentage = (Number(investment) / totalInvestments) * 100
}

const deleteUser = async(req, res) => {}

const updateActiveState = async(req, res) => {
    console.log('updating status')
    const user = await User.findByIdAndUpdate(req.params.id, {active: req.body.active}).lean().exec()
    
    const report = await Report.findOne().sort({"datetime": -1}).limit(1)
    
    if(req.body.active == true) ++report.totalInvestors
    else --report.totalInvestors
    
    report.save()

    let mail ={}
    mail.subject = 'Account Status Update'
    if(user.active != true) mail.message = 'Your account is no longer active!'
    mail.message = `Your account has been activated!`
    await sendEmail(user.email, mail)

    const filter = { active: true, role: 25}

    res.status(200).json(user)
}

const updateInvestment = async(req,res) => {
    const latestReport = await Report.findOne().limit(1).sort({$natural:-1}) 
    console.log(req.body)

    const updatedUser = await User.findByIdAndUpdate(req.params.id,{
        $inc: {
            initialInvestment: req.body.updateValueBy,
            portfolioValue: req.body.updateValueBy,
            cashOnHand: req.body.updateValueBy
        },
    }, {new: true})

    updatedUser.percentage = ((updatedUser.portfolioValue - updatedUser.initialInvestment)/updatedUser.initialInvestment) * 100
    await updatedUser.save()

    if(!updatedUser) return res.status(400)
    
    const updatedReport = await Report.findByIdAndUpdate(latestReport._id,{
        $inc: {
            initialInvestment: req.body.updateValueBy,
            totalFunding: req.body.updateValueBy,
            cashOnHand: req.body.updateValueBy,
        }
    })

    let mail = {
        subject: `Your Investment Has Been Updated!`,
        message: `Congratulations, your account has been updated by ${req.body.updateValueBy}.\n Your portfolio value is now ${updatedUser.portfolioValue}`
    }
    
    let emailResult = await sendEmail( updatedUser.email, mail )

    res.status(200).json(updatedUser)
}

const updateUserInfo = async(req,res) => {
    const userId = req.params.id;
    const updateData = req.body; 
    console.log(updateData)

    if(updateData.password){
        updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    try {
        let updatedUser = await User.findByIdAndUpdate(
            userId, 
            { $set: updateData }, // Directly using updateData with dot notation fields
            { new: true, runValidators: true } // Return the updated document and run validators
        );

        if (!updatedUser) {
            return res.status(404).send('User not found.');
        }

        if(updatedUser && updateData?.active == true){
            let emailDetails ={
                subject: 'Activate Your Investor Watch Account',
                text: `Hi ${updatedUser.email}, please use the following link to finish activating your Investor Watch Account: localhost:3000/account/activation/${updatedUser._id}`,
                html: `<div><p>Hi ${updatedUser.email}, please use the following link to finish activating your Investor Watch Account:</p><a href="http://localhost:3000/account/activation/${updatedUser._id}">Click To Register</a></div>`,
            }
            sendEmail(updatedUser.email, emailDetails)
        }


        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update user failed:', error);
        res.status(500).send('Internal Server Error');
    }
    // res.status(200)
}

const resetPassword = async(req,res) => {
    const foundUser = await User.findByIdAndUpdate(req.params.id,{
        password: await bcrypt.hash(req.body.password, 10)
    }, {new: true})

    if(!foundUser) return res.status(400).json({error: 'No user found!'})

    let mail = {
        subject: `Your password has been reset!`,
        message: `Congratulations, you have successfully reset your password! Please contact the admin if you have any questions.`
    }
    
    let emailResult = await sendEmail( foundUser.email, mail )
    console.log('password changed')
    res.status(200).json(foundUser)
}


module.exports = {
    getUsers,
    getUserProfile,
    createUser,
    deleteUser,
    updateActiveState,
    csvUpdate,
    updateInvestment,
    updateUserInfo,
    resetPassword
}