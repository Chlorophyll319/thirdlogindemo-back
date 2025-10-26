import 'dotenv/config'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import cors from 'cors'
import mongoose from 'mongoose'
import passport from 'passport'
import './passport.js'

// 引入 Passport 配置
import './passport.js'

// 引入路由
import userRouter from './routers/user.js'

// 🔌 連接 MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 連線成功')
  })
  .catch((error) => {
    console.error('❌ MongoDB 連線失敗:', error)
    process.exit(1)
  })

// 建立 express 伺服器
const app = express()

// 中介軟體設定
app.use(express.json())

// 使用 CORS 中介軟體（處理跨域請求）
app.use(cors())

// 🔐 初始化 Passport
app.use(passport.initialize())

// 📍 設置路由
app.use('/user', userRouter)

// ↓錯誤處理 (JSON 格式錯誤)
app.use((err, req, res, _next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: 'JSON 格式錯誤',
  })
})

// 處理未定義的路由
app.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到該路由',
  })
})

// 監聽與啟動

// app.listen(4000, () => {
//   console.log('伺服器啟動')
// })

// GCP

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
