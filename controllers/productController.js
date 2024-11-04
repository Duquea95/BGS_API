const { processSale } = require("../hooks/calculations")
const Message = require("../models/Inquiry")
const Product = require("../models/Product")
const Report = require("../models/Report")
const TransactionSchema = require("../models/TransactionSchema")
const User = require("../models/User")
const WithdrawalSchema = require("../models/WithdrawalSchema")

const addProduct = async(req,res) => {
    const {title, reference, costPrice, retailPrice, productImage } = req.body
    console.log(req.body)

    if(!title || !costPrice || !retailPrice) return res.status(404).err

    const users = await User.find({role: 25}).lean().exec()

    // console.log(users)
    
    let investorCost = Number(costPrice / users.length)
    // console.log(investorCost)

    let breakdown = users.map( (user) => {
        return {user: user._id, cost: investorCost.toFixed(2)}
    })

    // console.log(breakdown)
    
    const product = await Product.create({
        title,
        reference,
        costPrice,
        retailPrice,
        breakdown,
        productImage,
    })

    await product.save()
    // console.log(product)

    res.status(200)
}

const deleteProduct = async(req,res) => {
    res.status(200)
}
const deleteAll = async(req,res) => {
    await Product.deleteMany({});
    await TransactionSchema.deleteMany({});
    await User.deleteMany({role: 25});
    const admin = await User.findOneAndUpdate({role: 100}, {
        portfolioValue: 0,
        cashOnHand: 0,
        netProfitLoss: 0,
        initialInvestment: 0
    });
    await Report.deleteMany({});
    await WithdrawalSchema.deleteMany({});
    await Message.deleteMany({});

    // const report = await Report.findOne().sort({"datetime": -1}).limit(1)
    const report = await Report.create({
        totalFunding: 0,
        cashOnHand: 0,
        cashInventoryHeld: 0,
        netProfitLoss: 0,
        initialInvestment: 0,
        totalInvestors: 0,
        totalTransactions: 0,
        totalPurchased: 0,
        totalSold: 0,
    })

    await report.save()
    
    res.status(200)
}

const editProduct = async(req,res) => {
    res.status(200)
}

const productSold = async(req,res) => {
    const { companyShare, shareholderShare } = processSale(req.body)

    console.log('Product Sold')
    console.log(companyShare)
    console.log(shareholderShare)
    res.status(200)
}

const getProducts = async(req,res) => {
    const products = await Product.find().lean().exec()
    console.log(products)
    res.status(200).json(products)
}

const csvUpdateProducts = async(req,res) => {   
    await Promise.all(
        req.body.map(async (item)=>{
            let productExists = await Product.findOne({serialNumber: item['Serial Number']})

            if(productExists) return

            return await Product.create({
                brand: item['Brand'],
                referenceNumber: item['Reference Number'],
                serialNumber: item['Serial Number'],
                costPrice: item['Amount'],
            })
        })
    )

    let products = await Product.find().lean().exec()

    res.status(200).json(products)
}

module.exports = {
    addProduct,
    deleteProduct,
    editProduct,
    getProducts,
    productSold,
    csvUpdateProducts,
    deleteAll
}