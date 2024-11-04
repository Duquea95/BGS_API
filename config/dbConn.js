
const mongoose = require('mongoose')

const connectDB = async(MONGODB_URI) => {
  try{
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI)
  } catch(err){
    console.log(err)
  }
}

module.exports = connectDB