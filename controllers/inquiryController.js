const Inquiry = require("../models/Inquiry");
const Item = require("../models/Item");
const User = require("../models/User");

const createInquiry = async (req,res) => {
    console.log(req.body)
    try{
        const { 
            labelType,
            firstName,
            lastName,
            email,
            phoneNumber,
            // street,
            // aptUnit,
            // city,
            // state,
            // zipCode, 
            itemType, 
            // description,
            gold,
            weight,
            carat,
            brand,
            reference
        } = req.body
    
        // Step 1: Create User if not existing
        let user = await User.findOne({ email: email });
        if (!user) {
            user = new User({
                firstName,
                lastName,
                email,
                phoneNumber,
                // address: {
                //     street,
                //     aptUnit,
                //     city,
                //     state,
                //     zipCode
                // }
            });
            await user.save();
        }

        // Step 2: Create a new item
        let itemData = {}
        console.log(itemType)

        if(itemType == 'Gold'){
            itemData = {
                type: itemType,
                gold,
                weight
            }
        }else if (itemType == "Diamond"){
            itemData = {
                type: itemType,
                carat
            }
        }else if (itemType == 'Watch'){
            itemData = {
                type: itemType,
                brand,
                reference
            }
        }

        console.log('Item Data')
        console.log(itemData)


        const item = new Item({
            ...itemData,
            userId: user._id,
        });
        await item.save();
    
        // Step 3: Create a new transaction
        const inquiry = new Inquiry({
            userId: user._id,
            itemId: item._id,
            labelType,
            status: 'Pending', // Initial status of the transaction
        });
        await inquiry.save();
    
        console.log('sucess')
        res.status(200).json({message: 'Inquiry Created'})
    } catch (error) {
        console.error('Error handling form submission:', error);
        res.status(500).json({ message: 'Server error while submitting the form.' });
    }
}

const getInquiries = async(req,res) => {
    try{
        const inquiries = await Inquiry.find().populate('itemId').populate('userId').lean().exec()
        
        console.log('GET Inquiries successful')
        res.status(200).json(inquiries)
    }catch(error){
        console.error('Error retreiving Inquiries')
        res.status(500).json({
            message: 'Server error while retrieving inquiries'
        })
    }
}

module.exports ={
    createInquiry,
    getInquiries
}