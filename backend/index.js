require('dotenv').config()
const cloudinary = require('cloudinary').v2
const config = require('./config.json')
const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
const express = require('express')
const cors = require('cors')

const jwt = require('jsonwebtoken')
const upload = require('./multer')
const fs = require('fs')
const path = require('path')

const { authenticateToken } = require('./utilities')

const User = require('./models/user.model')
const TravelStory = require('./models/travelStory.model')

mongoose.connect(config.connectionString)

const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))

cloudinary.config({
  cloud_name: 'dy8ad5o14',
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

// Test api
app.post('/create-account', async (req, res) => {
  const { fullName, email, password } = req.body

  if (!fullName || !email || !password) {
    return res.status(400).json({
      error: true,
      message: '所有字段必填',
    })
  }

  const isUser = await User.findOne({ email })
  if (isUser) {
    return res.status(400).json({
      error: true,
      message: 'User already exists',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  })

  await user.save()

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '72h',
    }
  )
  return res.status(201).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: 'Registration successful',
  })
})

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: 'Email and Password are required',
    })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({
      error: true,
      message: 'User not found',
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(400).json({
      error: true,
      message: 'Invalid credentials',
    })
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '72h',
    }
  )
  return res.status(200).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: 'Login successful',
  })
})

// Get user
app.get('/get-user', authenticateToken, async (req, res) => {
  const { userId } = req.user
  const isUser = await User.findOne({ _id: userId })
  if (!isUser) {
    return res.sendStatus(401)
  }
  return res.json({
    user: isUser,
    message: '',
  })

  // const user = await User.findById(req.user.userId)
  // return res.status(200).json({
  //   error: false,
  //   user: { fullName: user.fullName, email: user.email },
  //   message: 'User found',
  // })
})

// Add Travel Story
app.post('/add-travel-story', authenticateToken, async (req, res) => {
  // Validate required fields
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body
  const { userId } = req.user
  if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
    return res.status(400).json({
      error: true,
      message: '所有字段必填',
    })
  }
  // Convert visitedDate from milliseconds to Date object
  const parsedVisitedDate = new Date(parseInt(visitedDate))
  try {
    const travelStory = new TravelStory({
      title,
      story,
      visitedLocation,
      userId,
      imageUrl,
      visitedDate: parsedVisitedDate,
    })

    await travelStory.save()
    res
      .status(201)
      .json({ story: travelStory, success: true, message: '新增成功' })
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message,
    })
  }
})

app.get('/get-all-stories', authenticateToken, async (req, res) => {
  const { userId } = req.user
  try {
    const travelStories = await TravelStory.find({ userId: userId }).sort({
      isFavourite: -1,
    })
    res.status(200).json({ stories: travelStories })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})



app.post('/image-upload', upload.single('image'), async (req, res) => {
  try {
    console.log(req.file, 'file')
    if (!req.file) {
      return res.status(400).json({ error: true, message: '未上传图片' })
    }

    // Upload the image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'dushu',
    })

    console.log(uploadResult, 'uploadResult')

    // Optimize delivery by resizing and applying auto-format and auto-quality
    // const imageUrl = cloudinary.url(uploadResult.public_id, {
    // fetch_format: 'auto',
    // quality: 'auto',
    // })
    // console.log(imageUrl, 'imageUrl')

    // Delete the temporary file from local storage
    fs.unlinkSync(req.file.path)

    res.status(200).json({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: true, message: error.message })
  }
})

// Delete an image
app.delete('/delete-image', async (req, res) => {
  const { imageUrl } = req.query
  if (!imageUrl) {
    return res.status(400).json({
      error: true,
      message: 'imageUrl parameter is required',
    })
  }
  try {
    // Extract the filename from the imageUrl
    const filename = path.basename(imageUrl)
    console.log('filename', filename)
    // Define the file path
    const filePath = path.join(__dirname, 'uploads', filename)
    console.log('filePath', filePath)
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file from the uploads folder
      fs.unlinkSync(filePath)
      res.status(200).json({ message: '图片删除成功', success: true })
    } else {
      res.status(200).json({ error: true, message: 'Image not found' })
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

app.put('/edit-story/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body
  const { userId } = req.user

  // Validate required fields
  if (!title || !story || !visitedLocation || !visitedDate) {
    return res.status(400).json({
      error: true,
      message: '所有字段必填',
    })
  }

  // Convert visitedDate from milliseconds to Date object
  try {
    // Find the travel story by ID and ensure it belongs to the authenticated user
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId })
    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: 'Travel story not found' })
    }

    // Parse visitedDate safely
    const timestamp = Number(visitedDate)
    if (isNaN(timestamp)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid visitedDate format',
      })
    }

    const placeholderImgUrl = `http://localhost:8000/assets/placeholder.jpg`
    const parsedVisitedDate = new Date(parseInt(visitedDate))

    travelStory.title = title
    travelStory.story = story
    travelStory.visitedLocation = visitedLocation
    travelStory.imageUrl = imageUrl || placeholderImgUrl
    travelStory.visitedDate = parsedVisitedDate

    // Save changes
    await travelStory.save()

    res.status(200).json({
      success: true,
      message: 'Travel story updated successfully',
      travelStory,
    })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Delete a travel story
app.delete('/delete-story/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { userId } = req.user

  try {
    // Find the travel story by ID and ensure it belongs to the authenticated user
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId })
    if (!travelStory) {
      return res.status(404).json({
        error: true,
        message: 'Travel story not found',
      })
    }

    // Delete the travel story from the database
    await travelStory.deleteOne({ _id: id, userId: userId })
    // Extract the filename from the database
    const imageUrl = travelStory.imageUrl
    const filename = path.basename(imageUrl)

    // Define the file path
    const filePath = path.join(__dirname, 'uploads', filename)

    // Delete the image file from the uploads folder
    fs.unlink(filePath, err => {
      if (err) {
        console.error('Failed to delete image file:', err)
        return res.status(500).json({
          error: true,
          message: 'Error deleting image file',
        })
      }
    })
    res.status(200).json({
      success: true,
      message: 'Travel story deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Update isFavourite
app.put('/update-is-favourite/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { isFavourite } = req.body
  const { userId } = req.user

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId })
    if (!travelStory) {
      return res.status(404).json({
        error: true,
        message: 'Travel story not found',
      })
    }

    travelStory.isFavourite = isFavourite
    await travelStory.save()

    res.status(200).json({
      success: true,
      message: 'isFavourite updated successfully',
      travelStory,
    })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Search travel stories
app.get('/search', authenticateToken, async (req, res) => {
  const { searchQuery } = req.query
  const { userId } = req.user

  if (!searchQuery) {
    return res.status(400).json({
      error: true,
      message: 'searchQuery parameter is required',
    })
  }

  try {
    const searchResults = await TravelStory.find({
      userId: userId,
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { story: { $regex: searchQuery, $options: 'i' } },
        { visitedLocation: { $regex: searchQuery, $options: 'i' } },
      ],
    }).sort({ isFavourite: -1 })
    res.status(200).json({ stories: searchResults })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Filter travel stories by date range
app.get('/travel-stories/filter', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query
  const { userId } = req.user

  try {
    // Convert startDate and endDate to Date objects
    const start = new Date(parseInt(startDate))
    const end = new Date(parseInt(endDate))

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ error: true, message: 'Invalid date format' })
    }

    // Find travel stories that belong to the authenticated user and fall within the date range
    const filteredStories = await TravelStory.find({
      userId: userId,
      visitedDate: {
        $gte: start,
        $lte: end,
      },
    }).sort({ isFavourite: -1 })
    res.status(200).json({ stories: filteredStories })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Serve static files from the uploads and assets directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/assets', express.static(path.join(__dirname, 'assets')))

const port = process.env.PORT || 8000
app.listen(port)
module.exports = app

console.log(`Server is running on port ${port}`)
