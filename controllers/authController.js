require('dotenv').config()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const asyncHandler = require('express-async-handler')
// const Address = require('../models/Address')
// const Order = require('../models/Order')
// const Menu = require('../models/Menu')

const login = async(req,res) =>{
  const { email, password } = req.body
  
  if(!email || !password){
    return res.status(400).json({message: 'All Fields Are Required'})
  }
  
  const user = await User.findOne({email: email.toLowerCase()}).lean().exec()
  

  if( !user ){
    return res.status(401).json({message: 'Unauthorized! User not found!'})
  }
  
  const match = await bcrypt.compare(password, user.password)

  if(!match) return res.status(400).json({message: 'Unauthorized! Credentials do not match.'})
  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "email": user.email,
        "role": user.role
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: '900s'}
  )  

  const refreshToken = jwt.sign(
    {"email": user.email},
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: '1d'}
  )
  res.cookie('_id', user._id.toString(),{
     httpOnly: true, sameSite: 'None', secure: true}
  )
  res.cookie('accessToken', accessToken, { 
    httpOnly: true, sameSite: 'None', secure: true}
  )
  res.cookie('jwt',refreshToken, {
    httpOnly: true, //accessible only on web server
    secure: true, // https
    sameSite: 'None', // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000 //set to match RToken
  })

  console.log("Login successful! Sending accessToken to Front: apiCall.js")

  delete user.password

  return res.status(200).json({user})
  // return res.status(200).json({accessToken, user})
  // if(isAdmin == false){
  //   const orders = await Order.find({userID: foundUser._id}).sort({ 'orderNumber' : -1 }).limit(10).lean().exec()
      
  //   return res.status(200).json({accessToken, foundUser, orders})
  // }
  // else{
  //   const orders = await Order.find().lean().exec()
  //   const menu = await Menu.findById('650f50cfb71404638d9daaa8')
  //   return res.status(200).json({accessToken, foundUser, orders, menu})
  //   return res.status(200).json({accessToken, foundUser})
  // }
}

const refresh = (req,res) => {
  const cookies = req.cookies
  // console.log(req.cookies)
  
  if(!cookies?.jwt) return res.status(400).json({message: "Unauthorized! Where's your cookie?"})
  
  const refreshToken = cookies.jwt
  
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async(err, decoded) => {
      // console.log(refreshToken)
      if(err) return res.status(403).json({message: 'Verification forbidden'})

      const foundUser = await User.findOne({ email: decoded.email}).lean().exec()

      
      if(!foundUser) return res.status(401).json({message: 'User not verified.'})
      // console.log(foundUser)

      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "email": foundUser.email,
            "roles": foundUser.roles,
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '1d'},
      )

      console.log("Refresh successful.")
      res.status(200).json({accessToken})

    })
  )
}

const logout = (req,res) => {
  const cookies = req.cookies
  console.log("logout called.")
  if(!cookies?.jwt) return res.sendStatus(404)
  
  console.log("cookie found")
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true})
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'None', secure: true})
  res.clearCookie('_id', { httpOnly: true, sameSite: 'None', secure: true})

  res.status(200).json({message: 'Logout successful! Cookie cleared.'})
}

module.exports = {
  login,
  refresh, 
  logout
}