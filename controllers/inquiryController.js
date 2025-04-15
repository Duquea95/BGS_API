const {Storage} = require('@google-cloud/storage')
require('dotenv').config()
const Inquiry = require("../models/Inquiry");
const Item = require("../models/Item");
const User = require("../models/User");
const UserAgreement = require('../models/UserAgreement');
const { sendEmail } = require('../features/mailer');
// const multer = require('multer');

// const projectId = process.env.PROJECT_ID
// const keyFilename = process.env.KEYFILENAME
// const storage = new Storage({
//     keyFilename: process.env.KEYFILENAME
// })

// const upload = multer({
//     storage: multer.memoryStorage(), // Store file in memory temporarily
// });

// async function uploadFile(bucketName,file, fileOutputName){
//     try{
//         const bucket = storage.bucket(bucketName)
//         const ret = await bucket.upload(file,{
//             destination:fileOutputName
//         })
//         return ret;
//     }catch(error){
//         console.log('Error',error)
//     }
    
// }


const postFile = async (req,res) => {
    console.log('Request received at /api/upload');
    
    const ret = await uploadFile(process.env.BUCKET_NAME, 'test.txt', 'AD.txt')
    console.log(ret)
    // Handle file upload logic
    // try {
    //     if (!req.file) {
    //       return res.status(400).json({ success: false, message: 'No file uploaded' });
    //     }
    
    //     const file = req.file;
    //     const blob = bucket.file(`uploads/${Date.now()}-${file.originalname}`);
    //     const blobStream = blob.createWriteStream({
    //       resumable: false,
    //       contentType: file.mimetype,
    //     });
    
    //     blobStream.on('error', (err) => {
    //       console.error('Error uploading file:', err);
    //       res.status(500).json({ success: false, message: 'Upload failed' });
    //     });
    
    //     blobStream.on('finish', () => {
    //       const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
    //       console.log(`File uploaded successfully: ${publicUrl}`);
    //       res.status(200).json({ success: true, url: publicUrl });
    //     });
    
    //     blobStream.end(file.buffer);
        
    // } catch (error) {
    //     console.error('Error handling upload:', error);
    //     res.status(500).json({ success: false, message: 'Internal server error' });
    // }
}

const createInquiry = async (req,res) => {
    try{
        const { 
            // labelType,
            firstName,
            lastName,
            email,
            phoneNumber,
            street,
            address2,
            city,
            state,
            zipCode, 
            description,
            insuranceValue,
            userConsent
        } = req.body
        console.log(req.body)
    
        // Step 1: Create User if not existing
        let user = await User.findOne({ email: email });

        if (!user) {
            user = new User({
                firstName,
                lastName,
                email,
                phoneNumber,
                address: {
                    street,
                    address2,
                    city,
                    state,
                    zipCode
                }
            });

            let userAgreement = new UserAgreement({
                userId: user._id,
                user_agreement_to_terms_and_condition: userConsent
            })

            await userAgreement.save()

            user.userAgreement = userAgreement._id
            await user.save()
        }
        console.log(user)
      
        const inquiry = new Inquiry({
            userId: user._id,
            description,
            insuranceValue,
            status: 'Pending', // Initial status of the transaction
        });
        await inquiry.save();
        console.log(inquiry)

        user.inquiries.push(inquiry._id);
        await user.save();

        let mail = {
            subject: 'BGS: New Inquiry Submitted',
            text: `
                First Name: ${user.firstName}
                Last Name: ${user.lastName}
                Email: ${user.email}
                PhoneNumber: ${user.phoneNumber}
                Street: ${user.street}
                Address 2: ${user?.address2}
                City: ${user.city}
                State: ${user.state}
                Zip Code: ${user.zipCode}
                description: ${inquiry.description}
                insuranceValue: ${inquiry.insuranceValue},
            `,
            html: `
            <div>
                <p>New Inquiry Received</p>
                <ul>
                    <li>First Name: ${user.firstName}</li>
                    <li>Last Name: ${user.lastName}</li>
                    <li>Email: ${user.email}</li>
                    <li>Phone Number: ${user.phoneNumber}</li>
                    <li>Street: ${user.address.street}</li>
                    <li>Address 2: ${user.address?.address2}</li>
                    <li>City: ${user.address.city}</li>
                    <li>State: ${user.address.state}</li>
                    <li>Zip Code: ${user.address.zipCode}</li>
                    <li>Description: ${inquiry.description}</li>
                    <li>Insurance Value: ${inquiry.insuranceValue}</li>,
                </ul>
            </div>`
        }

        // await sendEmail('anthony@omijewelry.com', mail)
        await sendEmail('brandon@jdwnyc.com', mail)
    
        console.log('sucess')
        res.status(200).json({message: 'Inquiry Created'})
    } catch (error) {
        console.error('Error handling form submission:', error);
        res.status(500).json({ message: 'Server error while submitting the form.' });
    }
}

const getInquiries = async(req,res) => {
    try{
        const inquiries = await Inquiry.find().populate('userId').lean().exec()
        
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
    getInquiries,
}