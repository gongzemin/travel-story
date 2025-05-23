const express = require('express')
const { authenticateToken } = require('../utilities')
const TravelStory = require('../models/travelStory.model')
const User = require('../models/user.model')
const upload = require('../multer')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const path = require('path')

cloudinary.config({
  cloud_name: 'dy8ad5o14',
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

const router = express.Router()

// Add Travel Story
router.post('/add-travel-story', authenticateToken, async (req, res) => {
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

router.get('/get-all-stories', authenticateToken, async (req, res) => {
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

// /image-upload 单独拆成一个 upload.routes.js？
//（如果你的图片功能会多起来，比如多图上传、删除多个图片，这样会更清爽！
router.post('/image-upload', upload.single('image'), async (req, res) => {
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
    // Generate an optimized URL
    const optimizedImageUrl = cloudinary.url(uploadResult.public_id, {
      secure: true,
      transformation: [
        { fetch_format: 'auto' },
        { quality: 'auto' },
        // { width: 800, crop: 'limit' }, // optional
      ],
    })

    // Delete the temporary file from local storage
    fs.unlinkSync(req.file.path)

    res.status(200).json({
      imageUrl: optimizedImageUrl,
      publicId: uploadResult.public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: true, message: error.message })
  }
})

// Delete an image
router.delete('/delete-image', async (req, res) => {
  const { imageUrl } = req.query

  if (!imageUrl) {
    return res.status(400).json({
      error: true,
      message: 'imageUrl parameter is required',
    })
  }

  try {
    // ========== 1. Delete from Cloudinary ==========
    const cloudinaryRegex = /\/v\d+\/(.+)\.(jpg|jpeg|png|webp|gif)$/i
    const match = imageUrl.match(cloudinaryRegex)
    if (match) {
      const publicId = match[1] // extract publicId
      console.log('Deleting from Cloudinary:', publicId)
      await cloudinary.uploader.destroy(publicId)
    }

    // ========== 2. Delete from local uploads folder ==========
    const filename = path.basename(imageUrl)
    const filePath = path.join(__dirname, 'uploads', filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('Deleted from local filesystem:', filePath)
    }

    res.status(200).json({ message: '图片删除成功', success: true })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

router.put('/edit-story/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body
  const { userId } = req.user

  // 验证必填字段
  if (!title || !story || !visitedLocation || !visitedDate) {
    return res.status(400).json({
      error: true,
      message: '所有字段必填',
    })
  }

  try {
    // 解析 visitedDate
    const timestamp = Number(visitedDate)
    if (isNaN(timestamp)) {
      return res.status(400).json({
        error: true,
        message: '日期格式无效',
      })
    }

    const parsedVisitedDate = new Date(timestamp)
    const placeholderImgUrl = `http://localhost:8000/assets/placeholder.jpg`

    // 使用 findByIdAndUpdate 更新文档
    const updatedStory = await TravelStory.findByIdAndUpdate(
      id,
      {
        title,
        story,
        visitedLocation,
        imageUrl: imageUrl || placeholderImgUrl,
        visitedDate: parsedVisitedDate,
        userId, // 确保 userId 未被更改
      },
      {
        new: true, // 返回更新后的文档
        runValidators: true, // 运行 Schema 验证
      }
    )

    // 检查文档是否存在且属于当前用户
    if (!updatedStory || updatedStory.userId.toString() !== userId) {
      return res.status(404).json({
        error: true,
        message: '笔记不存在或无权访问',
      })
    }

    res.status(200).json({
      success: true,
      message: '更新成功',
      travelStory: updatedStory,
    })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Delete a travel story
router.delete('/delete-story/:id', authenticateToken, async (req, res) => {
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
      message: '删除成功',
    })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Update isFavourite
router.put('/update-is-favourite/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { isFavourite } = req.body
  const { userId } = req.user

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId })
    if (!travelStory) {
      return res.status(404).json({
        error: true,
        message: '未找到数据',
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
router.get('/search', authenticateToken, async (req, res) => {
  const { searchQuery } = req.query
  const { userId } = req.user

  if (!searchQuery) {
    return res.status(400).json({
      error: true,
      message: '需要提供查询参数',
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
router.get('/travel-stories/filter', authenticateToken, async (req, res) => {
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
module.exports = router
