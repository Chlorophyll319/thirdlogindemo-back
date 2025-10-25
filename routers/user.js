import { Router } from 'express'
import passport from 'passport'
import * as userController from '../controllers/userController.js'
import auth from '../middlewares/auth.js'

const router = Router()

/**
 * @route   GET /user/auth/google
 * @desc    導向 Google 登入頁面
 * @access  Public
 */
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
)

/**
 * @route   GET /user/auth/google/callback
 * @desc    Google 認證回調處理
 * @access  Public
 */
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  userController.googleAuthCallback,
)

/**
 * @route   GET /user/profile
 * @desc    取得當前登入使用者的個人資料
 * @access  Private (需要 JWT)
 */
router.get('/profile', auth, userController.getProfile)

/**
 * @route   POST /user/refresh
 * @desc    更新 Token (允許過期的 token 進行更新)
 * @access  Private (需要 JWT, 允許過期)
 */
router.post('/refresh', auth, userController.refreshToken)

/**
 * @route   POST /user/logout
 * @desc    登出 (移除當前 token)
 * @access  Private (需要 JWT)
 */
router.post('/logout', auth, userController.logout)

/**
 * @route   POST /user/logout/all
 * @desc    登出所有裝置 (清空所有 tokens)
 * @access  Private (需要 JWT)
 */
router.post('/logout/all', auth, userController.logoutAll)

export default router
