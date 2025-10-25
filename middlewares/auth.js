import passport from 'passport'
import { StatusCodes } from 'http-status-codes'

/**
 * JWT 驗證中介層
 * 用於保護需要登入才能存取的路由
 */
const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, data, info) => {
    // 🚨 錯誤處理
    if (error) {
      console.error('JWT 驗證錯誤:', error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器錯誤',
      })
    }

    // ❌ 驗證失敗
    if (!data) {
      console.log('JWT 驗證失敗:', info?.message || '未知錯誤')
      const status =
        info?.message === 'token 已過期' ? StatusCodes.UNAUTHORIZED : StatusCodes.UNAUTHORIZED

      return res.status(status).json({
        success: false,
        message: info?.message || 'JWT 驗證失敗',
      })
    }

    // ✅ 驗證成功，將 user 和 token 資料附加到 req
    req.user = data.user
    req.token = data.token
    next()
  })(req, res, next)
}

export default auth
