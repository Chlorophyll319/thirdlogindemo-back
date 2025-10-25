import { Schema, model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

// 定義使用者 Schema
const userSchema = new Schema(
  {
    // Email (必填, 唯一)
    email: {
      type: String,
      required: [true, 'Email 為必填欄位'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Email 格式不正確',
      },
    },
    // 密碼 (選填 - Google 登入不需要)
    password: {
      type: String,
      minlength: [6, '密碼長度至少 6 個字元'],
      // Google 登入時不需要密碼
      required: function () {
        return !this.googleId
      },
    },
    // Google 使用者 ID (選填)
    googleId: {
      type: String,
      default: null,
    },
    // 顯示名稱
    displayName: {
      type: String,
      required: [true, '顯示名稱為必填欄位'],
      trim: true,
    },
    // 頭像 URL
    avatar: {
      type: String,
      default: '',
    },
    // JWT tokens 陣列 (支援多裝置登入)
    tokens: {
      type: [String],
      default: [],
    },
  },
  {
    // 自動管理 createdAt 和 updatedAt
    timestamps: true,
    // 虛擬欄位也要包含在 JSON 中
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // 不回傳敏感資料
        delete ret.password
        delete ret.tokens
        delete ret.__v
        return ret
      },
    },
  },
)

// Pre-save hook: 密碼加密
userSchema.pre('save', async function (next) {
  // 只有在密碼被修改時才加密
  if (this.isModified('password') && this.password) {
    try {
      // 使用 bcrypt 加密密碼 (salt rounds = 10)
      this.password = await bcrypt.hash(this.password, 10)
    } catch (error) {
      return next(error)
    }
  }
  next()
})

// 實例方法: 驗證密碼
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false
  }
  return await bcrypt.compare(candidatePassword, this.password)
}

// 實例方法: 生成 JWT token (在 controller 中使用)
// 註: JWT 的生成會在 controller 中處理

// 建立並匯出 Model
export default model('User', userSchema)
