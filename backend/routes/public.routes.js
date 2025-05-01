// routes/public.routes.js
const express = require('express')
const TravelStory = require('../models/travelStory.model')

const router = express.Router()

// Get user
router.get('/get-user', async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(200).json({ user: null, message: '未登录' })
  }

  const user = await User.findById(req.user.userId)
  if (!user) {
    return res.status(401).json({ user: null, message: '未找到用户' })
  }

  return res.status(200).json({
    user,
    message: '用户信息获取成功',
  })
  // const { userId } = req.user
  // const isUser = await User.findOne({ _id: userId })
  // if (!isUser) {
  //   return res.sendStatus(401)
  // }
  // return res.json({
  //   user: isUser,
  //   message: '',
  // })

  // const user = await User.findById(req.user.userId)
  // return res.status(200).json({
  //   error: false,
  //   user: { fullName: user.fullName, email: user.email },
  //   message: 'User found',
  // })
})

// 获取标签故事（公开）
router.get('/get-tag-stories', async (req, res) => {
  const { filterType, tag } = req.query

  try {
    let sortOption = {}
    let queryOption = {}
    if (tag) {
      queryOption.tags = tag
    }
    if (filterType === '热门') {
      sortOption = { favouriteCount: -1 }
    } else if (filterType === 'visitedDate') {
      sortOption = { createdOn: -1 }
    } else {
      sortOption = { visitedDate: -1 } // 注意这里 "VisitedDate" 小写！（你原来写错大小写了！）
    }
    const stories = await TravelStory.find().sort(sortOption) // TravelStory.find(queryOption).sort(sortOption)
    res.status(200).json({ stories })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

module.exports = router
