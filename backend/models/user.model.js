const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
})

// 3️⃣ 切换到 book 数据库
const bookDB = mongoose.connection.useDb('book')

module.exports = bookDB.model('User', userSchema)
