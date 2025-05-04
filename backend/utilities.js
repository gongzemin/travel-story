const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  // No token, unauthorized
  if (!token) {
    return res
      .status(401)
      .json({ error: true, message: '缺少访问令牌，请登录' })
  }

  // Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ error: true, message: '访问令牌无效或已过期' })
    }

    req.user = user
    next()
  })
}

// Create a new middleware authenticateTokenOptional for optional-auth routes only (like /get-user).
// 	authenticateTokenOptional: loose, allows anonymous users
function authenticateTokenOptional(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      req.user = null
    } else {
      req.user = user
    }
    next()
  })
}

module.exports = { authenticateToken, authenticateTokenOptional }
