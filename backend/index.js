require('./instrument.js')
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./config.json')

const Sentry = require('@sentry/node')
const path = require('path')

// mongoose.connect(config.connectionString)

const connectDB = async () => {
  try {
    await mongoose.connect(config.connectionString)
    console.log('MongoDB连接成功')
  } catch (err) {
    console.error('MongoDB连接失败:', err)
    process.exit(1)
  }
}

connectDB()

const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app)

// 挂载路由
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/mine', require('./routes/mine.js'))
app.use('/api/public', require('./routes/public.routes'))
// Serve static files from the uploads and assets directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/assets', express.static(path.join(__dirname, 'assets')))

const port = process.env.PORT || 8000
app.listen(port)
module.exports = app

console.log(`Server is running on port ${port}`)
