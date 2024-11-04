require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const multer = require('multer');
const upload = multer({ dest: "uploads/" });
var nodeCron = require('node-cron')
const app = express()

// const { generateAndSendReports } = require('./features/reportGenerator')
const corsOptions = require('./config/corsOptions')

const PORT = process.env.PORT || 8000
const connectDB = require('./config/dbConn')

connectDB(process.env.MONGODB_URI)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.set('view engine', 'pug')

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/auth', require('./routes/authRoutes'))
app.use('/inquiries', require('./routes/inquiryRoutes'))

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT,() => {
      console.log(`server is live on ${PORT}`)
    })
})
