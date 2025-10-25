import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

/**
 * Google 認證成功後的回調處理
 * 生成 JWT token 並重導向回前端
 */
export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user

    if (!user) {
      console.error('Google 認證失敗: 沒有使用者資料')
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
    }

    // 🔑 生成 JWT token (有效期 7 天)
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    // 💾 將 token 存入使用者的 tokens 陣列
    user.tokens.push(token)
    await user.save()

    console.log('Google 登入成功:', user.email)

    // 🔄 重導向回前端，並帶上 token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
  } catch (error) {
    console.error('googleAuthCallback 錯誤:', error)
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`)
  }
}

/**
 * 取得當前登入使用者的個人資料
 * 需要 JWT 驗證
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user

    // ✅ 回傳使用者資料 (密碼和 tokens 已在 Model 的 toJSON 中過濾)
    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('getProfile 錯誤:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '取得個人資料失敗',
    })
  }
}

/**
 * 登出
 * 從使用者的 tokens 陣列中移除當前 token
 */
export const logout = async (req, res) => {
  try {
    const user = req.user
    const token = req.token

    // 🗑️ 從 tokens 陣列中移除當前 token
    user.tokens = user.tokens.filter((t) => t !== token)
    await user.save()

    console.log('使用者登出:', user.email)

    res.status(StatusCodes.OK).json({
      success: true,
      message: '登出成功',
    })
  } catch (error) {
    console.error('logout 錯誤:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '登出失敗',
    })
  }
}

/**
 * 登出所有裝置
 * 清空使用者的所有 tokens
 */
export const logoutAll = async (req, res) => {
  try {
    const user = req.user

    // 🗑️ 清空所有 tokens
    user.tokens = []
    await user.save()

    console.log('使用者登出所有裝置:', user.email)

    res.status(StatusCodes.OK).json({
      success: true,
      message: '已登出所有裝置',
    })
  } catch (error) {
    console.error('logoutAll 錯誤:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '登出失敗',
    })
  }
}

/**
 * 更新 Token (Refresh Token)
 * 允許過期的 token 進行更新,移除舊 token 並生成新 token
 */
export const refreshToken = async (req, res) => {
  try {
    const user = req.user
    const oldToken = req.token

    // 🔑 生成新的 JWT token (有效期 7 天)
    const newToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    // 🔄 移除舊 token,加入新 token
    user.tokens = user.tokens.filter((t) => t !== oldToken)
    user.tokens.push(newToken)
    await user.save()

    console.log('Token 更新成功:', user.email)

    // ✅ 回傳新 token
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Token 更新成功',
      token: newToken,
    })
  } catch (error) {
    console.error('refreshToken 錯誤:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Token 更新失敗',
    })
  }
}
