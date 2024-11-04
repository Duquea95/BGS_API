const express = require('express')
const { getProducts, addProduct, deleteProduct, editProduct, productSold, csvUpdateProducts, deleteAll } = require('../controllers/productController')
const router = express.Router()

router.route('/')
    .get(getProducts)
    .post(addProduct)

router.route('/csvUpdate')
    .post(csvUpdateProducts)
    .delete(deleteAll)

    
router.route('/:id')
    .patch(editProduct)
    .delete(deleteProduct)

router.route('/:id/sold')
    .patch(productSold)

module.exports = router