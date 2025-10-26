import 'dotenv/config'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'

// 連接資料庫
await mongoose.connect(process.env.MONGODB_URI)
console.log('✅ MongoDB 連線成功')

try {
  // 1. 建立或查找測試用戶
  let testUser = await User.findOne({ email: 'test@example.com' })

  if (!testUser) {
    console.log('建立測試用戶...')
    testUser = await User.create({
      email: 'test@example.com',
      googleId: 'test-google-id-123',
      displayName: 'Test User',
      avatar: '',
      tokens: [],
    })
    console.log('✅ 測試用戶建立成功')
  } else {
    console.log('✅ 找到現有測試用戶')
  }

  // 2. 生成一個新的 token
  const token = jwt.sign({ _id: testUser._id }, process.env.JWT_SECRET, {
    expiresIn: '3m',
  })

  // 3. 將 token 加入用戶的 tokens 陣列
  testUser.tokens.push(token)
  await testUser.save()
  console.log('✅ Token 已加入用戶')
  console.log('\n🔑 測試用 Token:')
  console.log(token)
  console.log('\n📋 使用此 token 在 Postman 測試:')
  console.log(`Authorization: Bearer ${token}`)
  console.log('\n🌐 測試端點:')
  console.log('POST http://localhost:4000/user/refresh')
  console.log('\n⏰ Token 將在 3 分鐘後過期')

  // 4. 測試查詢效能
  console.log('\n\n⚡ 測試資料庫查詢效能...')
  const startTime = Date.now()
  const foundUser = await User.findOne({ _id: testUser._id, tokens: token })
  const queryTime = Date.now() - startTime

  if (foundUser) {
    console.log(`✅ 查詢成功 (耗時: ${queryTime}ms)`)
    console.log(`用戶: ${foundUser.email}`)
    console.log(`Token 數量: ${foundUser.tokens.length}`)
  } else {
    console.log('❌ 查詢失敗')
  }

  // 5. 檢查是否有大量 tokens 導致查詢變慢
  if (testUser.tokens.length > 10) {
    console.log(`\n⚠️  警告: 此用戶有 ${testUser.tokens.length} 個 tokens,可能影響查詢效能`)
    console.log('建議定期清理過期的 tokens')
  }
} catch (error) {
  console.error('❌ 測試過程發生錯誤:', error)
} finally {
  await mongoose.disconnect()
  console.log('\n✅ 資料庫連線已關閉')
}
