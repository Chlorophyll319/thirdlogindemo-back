import passport from 'passport'
import passportJWT from 'passport-jwt'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from './models/user.js'

// 🪪 jwt 策略 - Token 驗證
passport.use(
  'jwt',
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
      ignoreExpiration: true,
    },
    async (req, payload, done) => {
      try {
        // 🪙 取得原始 Bearer token
        const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
        // ⏰ 檢查 token 是否過期（以 payload.exp 判斷）
        const expired = payload.exp * 1000 < Date.now()
        // 🔍 判斷目前請求的 URL（避免 refresh/logout 因過期被擋）
        const url = req.baseUrl + req.path
        if (expired && url !== '/user/refresh' && url !== '/user/logout') {
          throw new Error('TOKEN EXPIRED')
        }
        // 👤 查詢使用者是否存在，且其 tokens 中包含此 token
        const user = await User.findOne({ _id: payload._id, tokens: token }).orFail(
          new Error('USER NOT FOUND'),
        )
        // ✅ 驗證成功，回傳 user 與 token 資料
        return done(null, { user, token })
      } catch (err) {
        console.log('passport.js jwt')
        console.error(err)
        if (err.message === 'USER NOT FOUND') {
          return done(null, false, { message: '使用者不存在或 token 已失效' })
        } else if (err.message === 'TOKEN EXPIRED') {
          return done(null, false, { message: 'token 已過期' })
        } else {
          return done(err)
        }
      }
    },
  ),
)

// 🌐 Google OAuth 策略 - Google 第三方登入
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Profile:', profile)

        // 從 Google profile 取得資料
        const email = profile.emails[0].value
        const googleId = profile.id
        const displayName = profile.displayName
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : ''

        // 📧 檢查使用者是否已存在 (用 email 查詢)
        let user = await User.findOne({ email })

        if (user) {
          // ✅ 使用者已存在
          // 如果之前沒有 googleId，現在更新它 (表示之前是用傳統方式註冊)
          if (!user.googleId) {
            user.googleId = googleId
            user.displayName = displayName || user.displayName
            user.avatar = avatar || user.avatar
            await user.save()
            console.log('已將 Google 帳號綁定到現有使用者')
          }
        } else {
          // ⭐ 建立新使用者
          user = await User.create({
            email,
            googleId,
            displayName,
            avatar,
            // Google 登入不需要密碼
          })
          console.log('已建立新使用者 (Google 登入)')
        }

        // ✅ 回傳使用者資料給 controller
        return done(null, user)
      } catch (error) {
        console.error('Google 策略錯誤:', error)
        return done(error, null)
      }
    },
  ),
)
