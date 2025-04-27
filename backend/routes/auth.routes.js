const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const router = express.Router()

// 注册
router.post('/create-account', async (req, res) => {
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
      message: '用户已经存在',
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
    message: '注册成功',
  })
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: '邮箱和密码是必填字段',
    })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({
      error: true,
      message: '用户不存在',
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(400).json({
      error: true,
      message: '密码错误',
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
    message: '登录成功',
  })
})

module.exports = router
