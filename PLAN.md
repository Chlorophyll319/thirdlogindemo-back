# Google 第三方登入後端實作計畫

## 📌 專案概述

本專案實作 Google OAuth 2.0 第三方登入功能，讓使用者可以透過 Google 帳號快速登入系統。

---

## 🎯 實作目標

1. ✅ 支援 Google OAuth 2.0 登入
2. ✅ 整合現有的 JWT 驗證機制
3. ✅ 支援同一 email 的多種登入方式 (傳統 + Google)
4. ✅ 完善的錯誤處理與安全性

---

## 📦 需要安裝的套件

```bash
npm install passport-google-oauth20
```

### 已安裝套件說明
- `passport` - 認證中介軟體核心
- `passport-jwt` - JWT 策略
- `passport-local` - 本地登入策略 (預留)
- `jsonwebtoken` - 生成與驗證 JWT token
- `mongoose` - MongoDB ODM
- `bcrypt` - 密碼加密 (傳統登入使用)
- `express` - Web 框架
- `cors` - 跨域請求處理
- `dotenv` - 環境變數管理

---

## 🗂️ 檔案結構

```
back/
├── models/
│   └── user.js              # 使用者資料模型
├── routers/
│   └── user.js              # 使用者路由
├── controllers/
│   └── userController.js    # 使用者控制器
├── middlewares/
│   └── auth.js              # JWT 驗證中介層
├── passport.js              # Passport 策略配置
├── index.js                 # 主程式進入點
├── .env                     # 環境變數 (不進版控)
└── package.json
```

---

## 🔧 實作步驟

### Step 1: 建立 User Model

**檔案:** `models/user.js`

**功能:**
- 定義使用者資料結構
- 支援傳統登入 (email + password)
- 支援 Google 登入 (googleId)
- 儲存 JWT tokens 陣列

**Schema 欄位:**
```javascript
{
  email: String (必填, unique, 驗證格式)
  password: String (選填, bcrypt 加密)
  googleId: String (選填, Google 使用者 ID)
  displayName: String (顯示名稱)
  avatar: String (頭像 URL)
  tokens: [String] (JWT token 陣列)
  createdAt: Date
  updatedAt: Date
}
```

**重點:**
- email 為主要識別欄位
- password 為選填 (Google 登入不需要)
- 使用 pre-save hook 自動加密密碼
- tokens 陣列支援多裝置登入

---

### Step 2: 更新環境變數

**檔案:** `.env`

**新增變數:**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/logindemo

# Google OAuth
GOOGLE_CLIENT_ID=你的Google Client ID
GOOGLE_CLIENT_SECRET=你的Google Client Secret
GOOGLE_CALLBACK_URL=http://localhost:4000/user/auth/google/callback

# 前端 URL (登入成功後重導向)
FRONTEND_URL=http://localhost:5173
```

**注意事項:**
- MONGODB_URI: MongoDB 連線字串
- Google 憑證已在專案根目錄的 .env 中設定
- FRONTEND_URL: 登入成功後要導回的前端頁面

---

### Step 3: 配置 Google OAuth 策略

**檔案:** `passport.js`

**新增內容:**
1. 引入 `passport-google-oauth20`
2. 配置 Google OAuth 策略
3. 實作認證回調函數

**策略邏輯:**
```
1. 使用者點擊 Google 登入
2. 導向 Google 授權頁面
3. 使用者授權後,Google 回傳 profile
4. 系統檢查 email 是否已存在:
   - 存在 → 更新 googleId (如果沒有)
   - 不存在 → 建立新使用者
5. 回傳使用者資料給 controller
```

**Google Profile 包含:**
- id (Google User ID)
- emails[0].value (Email)
- displayName (顯示名稱)
- photos[0].value (頭像 URL)

---

### Step 4: 建立認證中介層

**檔案:** `middlewares/auth.js`

**功能:**
- 使用 passport.authenticate('jwt') 驗證 JWT
- 保護需要登入的路由
- 錯誤處理與訊息回傳

**使用方式:**
```javascript
router.get('/profile', auth, userController.getProfile)
```

---

### Step 5: 建立 User Controller

**檔案:** `controllers/userController.js`

**實作功能:**

#### 1. `googleAuthCallback`
- **觸發時機:** Google 認證成功後
- **功能:**
  - 為使用者生成 JWT token
  - 將 token 存入資料庫
  - 重導向回前端並帶上 token (Query String)
- **重導向格式:** `http://localhost:5173/auth/callback?token=xxx`

#### 2. `getProfile`
- **需要:** JWT 驗證
- **功能:** 回傳當前登入使用者的個人資料
- **回傳資料:** email, displayName, avatar, googleId

#### 3. `refreshToken`
- **需要:** JWT 驗證 (允許過期的 token)
- **功能:**
  - 更新過期或即將過期的 token
  - 移除舊 token,生成並回傳新 token
  - 支援在 token 過期後仍可刷新
- **重點:** passport JWT 策略設定 `ignoreExpiration: true`,並在策略中判斷 URL 允許 `/user/refresh` 使用過期 token

#### 4. `logout`
- **需要:** JWT 驗證
- **功能:**
  - 從使用者的 tokens 陣列中移除當前 token
  - 支援單一裝置登出 (其他裝置仍可使用)

#### 5. `logoutAll`
- **需要:** JWT 驗證
- **功能:**
  - 清空使用者的所有 tokens
  - 登出所有裝置

---

### Step 6: 建立 User Router

**檔案:** `routers/user.js`

**路由規劃:**

| Method | Path | 說明 | 驗證 |
|--------|------|------|------|
| GET | `/auth/google` | 導向 Google 登入頁面 | ❌ |
| GET | `/auth/google/callback` | Google 回調處理 | ❌ |
| GET | `/profile` | 取得使用者資料 | ✅ JWT |
| POST | `/refresh` | 更新 Token (允許過期) | ✅ JWT (允許過期) |
| POST | `/logout` | 登出當前裝置 | ✅ JWT |
| POST | `/logout/all` | 登出所有裝置 | ✅ JWT |

**範例:**
```javascript
// Google 登入
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// Google 回調
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  userController.googleAuthCallback
)

// 取得個人資料
router.get('/profile', auth, userController.getProfile)

// 更新 Token
router.post('/refresh', auth, userController.refreshToken)

// 登出當前裝置
router.post('/logout', auth, userController.logout)

// 登出所有裝置
router.post('/logout/all', auth, userController.logoutAll)
```

---

### Step 7: 修改主程式

**檔案:** `index.js`

**新增內容:**
1. 連接 MongoDB
2. 初始化 Passport
3. 掛載 user router

**修改重點:**
```javascript
import mongoose from 'mongoose'
import userRouter from './routers/user.js'
import passport from 'passport'

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 連線成功'))
  .catch(err => console.error('MongoDB 連線失敗:', err))

// 初始化 passport
app.use(passport.initialize())

// 掛載路由
app.use('/user', userRouter)
```

---

## 🔄 完整認證流程

### 使用者操作流程

```
1. 使用者點擊「使用 Google 登入」按鈕
   ↓
2. 前端導向 GET /user/auth/google
   ↓
3. 後端重導向至 Google 授權頁面
   ↓
4. 使用者在 Google 頁面登入並授權
   ↓
5. Google 回調 /user/auth/google/callback
   ↓
6. 後端接收 Google profile，查詢/建立使用者
   ↓
7. 生成 JWT token 並存入資料庫
   ↓
8. 重導向回前端: http://localhost:5173/auth/callback?token=xxx
   ↓
9. 前端接收 token，儲存至 localStorage
   ↓
10. 前端使用 token 呼叫 /user/profile 取得使用者資料
```

### 技術流程說明

#### 階段 1: 發起登入
- 前端: `window.location.href = 'http://localhost:4000/user/auth/google'`
- 後端: Passport 攔截並重導向至 Google

#### 階段 2: Google 授權
- Google 顯示授權畫面
- 範圍: profile, email
- 使用者同意後 Google 回調

#### 階段 3: 處理回調
- URL: `/user/auth/google/callback?code=xxx`
- Passport 用 code 換 access token
- 用 access token 取得 user profile

#### 階段 4: 資料庫操作
```javascript
// 檢查 email 是否存在
const existingUser = await User.findOne({ email: profile.emails[0].value })

if (existingUser) {
  // 更新 googleId (如果沒有)
  if (!existingUser.googleId) {
    existingUser.googleId = profile.id
    await existingUser.save()
  }
  return done(null, existingUser)
} else {
  // 建立新使用者
  const newUser = await User.create({
    email: profile.emails[0].value,
    googleId: profile.id,
    displayName: profile.displayName,
    avatar: profile.photos[0].value
  })
  return done(null, newUser)
}
```

#### 階段 5: 生成與回傳 Token
```javascript
// Controller
const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
user.tokens.push(token)
await user.save()
res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
```

---

## 🔐 安全性考量

### 1. Token 管理
- JWT 設定過期時間 (建議 7 天)
- 儲存所有有效 token 到資料庫
- 登出時從陣列移除特定 token
- 可實作「登出所有裝置」功能 (清空 tokens 陣列)

### 2. 環境變數保護
- ✅ 不要將 `.env` 加入版控
- ✅ 使用 `.env.example` 作為範本
- ✅ Google Client Secret 要妥善保管

### 3. CORS 設定
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // 只允許前端網域
  credentials: true
}))
```

### 4. HTTPS
- 生產環境必須使用 HTTPS
- Google OAuth callback URL 建議使用 HTTPS

### 5. 資料驗證
- 驗證 email 格式
- 檢查必填欄位
- 防止 NoSQL Injection

---

## 🧪 測試方式

### 1. 使用瀏覽器測試 Google 登入

1. 在瀏覽器開啟: `http://localhost:4000/user/auth/google`
2. 完成 Google 授權
3. 檢查是否重導向回前端並帶有 token

### 2. 使用 Postman 測試 API

#### 測試取得個人資料
```http
GET http://localhost:4000/user/profile
Authorization: Bearer <你的JWT token>
```

預期回應:
```json
{
  "success": true,
  "data": {
    "email": "user@gmail.com",
    "displayName": "User Name",
    "avatar": "https://...",
    "googleId": "1234567890"
  }
}
```

#### 測試更新 Token
```http
POST http://localhost:4000/user/refresh
Authorization: Bearer <你的JWT token>
Content-Type: application/json
```

預期回應:
```json
{
  "success": true,
  "message": "Token 更新成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**重點:** 即使 token 已過期也可以使用此端點更新

#### 測試登出
```http
POST http://localhost:4000/user/logout
Authorization: Bearer <你的JWT token>
```

預期回應:
```json
{
  "success": true,
  "message": "登出成功"
}
```

#### 測試登出所有裝置
```http
POST http://localhost:4000/user/logout/all
Authorization: Bearer <你的JWT token>
```

預期回應:
```json
{
  "success": true,
  "message": "已登出所有裝置"
}
```

### 3. 檢查資料庫

使用 MongoDB Compass 或 mongosh:
```javascript
use logindemo
db.users.find().pretty()
```

確認欄位:
- ✅ email 正確
- ✅ googleId 已儲存
- ✅ tokens 陣列有資料
- ✅ password 為空 (Google 登入不需要)

---

## 🚨 常見問題與解決

### Q1: Google 回調時出現 "Redirect URI mismatch"

**原因:** Google Console 設定的回調 URL 與程式碼不符

**解決:**
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇專案 → API 和服務 → 憑證
3. 編輯 OAuth 2.0 用戶端 ID
4. 在「已授權的重新導向 URI」新增:
   ```
   http://localhost:4000/user/auth/google/callback
   ```
5. 確保與 `.env` 中的 `GOOGLE_CALLBACK_URL` 完全一致

### Q2: MongoDB 連線失敗

**檢查項目:**
- ✅ MongoDB 服務是否啟動 (`mongod` 或 MongoDB Compass)
- ✅ MONGODB_URI 是否正確
- ✅ 網路連線是否正常
- ✅ 防火牆是否阻擋 27017 port

### Q3: JWT 驗證失敗

**可能原因:**
- Token 格式錯誤 (需要 `Bearer <token>`)
- Token 已過期
- JWT_SECRET 不一致
- Token 已從資料庫移除 (已登出)

**除錯方式:**
```javascript
// 在 passport.js 中加入 console.log
console.log('Token:', token)
console.log('Payload:', payload)
console.log('User:', user)
```

### Q4: 同一個 email 用 Google 和傳統方式登入會如何?

**答:** 系統會判斷為同一使用者
- 第一次用 email+password 註冊 → 建立使用者 (無 googleId)
- 第二次用 Google 登入 (相同 email) → 更新該使用者，新增 googleId
- 兩種方式登入都是同一個帳號，共用資料

### Q5: 如何實作「登出所有裝置」?

**方法:** 清空整個 tokens 陣列

```javascript
// controllers/userController.js
export const logoutAll = async (req, res) => {
  try {
    req.user.user.tokens = []
    await req.user.user.save()
    res.json({ success: true, message: '已登出所有裝置' })
  } catch (error) {
    res.status(500).json({ success: false, message: '登出失敗' })
  }
}

// routers/user.js
router.post('/logout/all', auth, userController.logoutAll)
```

### Q6: Postman 測試時按下 Send 按鈕就變灰色卡住,但後端程式碼正常?

**現象:**
- Postman 顯示 "Sending request..." 並卡住
- 按鈕變成 "Cancel" 按鈕
- 使用 curl 測試同樣的端點卻正常運作

**原因:** 這通常是 Postman 客戶端的問題,而非後端程式碼問題

**解決方案:**

1. **檢查 Postman Request Timeout 設定**
   - 點擊右上角齒輪圖示 ⚙️ → Settings
   - 檢查 "Request timeout in ms" 設定
   - 建議設定為 30000 (30秒) 或更高

2. **關閉 SSL Certificate Verification**
   - Settings → General
   - 關閉 "SSL certificate verification"

3. **檢查 Proxy 設定**
   - Settings → Proxy
   - 確認沒有啟用會阻擋 localhost 的 proxy
   - 或者關閉 "Use system proxy"

4. **使用新的 Request**
   - 建立全新的 request (不要複製舊的)
   - 可能舊的 request 有快取或設定問題

5. **重啟 Postman**
   - 完全關閉 Postman
   - 重新開啟並再次測試

6. **使用 Postman Web 版本**
   - 訪問 https://web.postman.co/
   - 測試 web 版本是否有相同問題

7. **使用替代工具測試:**

   **方法 A: 使用 curl (命令列)**
   ```bash
   # Windows (PowerShell/CMD)
   curl -X POST http://localhost:4000/user/refresh ^
     -H "Content-Type: application/json" ^
     -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
     -v

   # macOS/Linux
   curl -X POST http://localhost:4000/user/refresh \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -v
   ```

   **方法 B: 使用 VS Code REST Client 擴充套件**

   建立 `test.http` 檔案:
   ```http
   ### 測試 Refresh Token
   POST http://localhost:4000/user/refresh
   Content-Type: application/json
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

   點擊 "Send Request" 即可測試

   **方法 C: 使用其他 API 測試工具**
   - Insomnia
   - Thunder Client (VS Code 擴充套件)
   - Hoppscotch (網頁版)

8. **檢查 Postman Console**
   - View → Show Postman Console (或 Ctrl+Alt+C)
   - 查看是否有錯誤訊息或網路問題

**驗證方法:**
使用 curl 快速驗證後端是否正常:
```bash
# 測試伺服器是否回應
curl -X POST http://localhost:4000/user/refresh \
  -H "Authorization: Bearer fake-token" \
  --max-time 5

# 如果在 5 秒內得到 401 或其他回應,代表後端正常
# 如果超時,才是後端問題
```

**結論:** 如果 curl 測試正常,問題 100% 在 Postman 客戶端,不是你的程式碼!

---

## 📚 Google OAuth 設定步驟

### 1. 建立專案
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 專案名稱: `test-logindemo`

### 2. 啟用 Google+ API
1. 左側選單 → API 和服務 → 程式庫
2. 搜尋 "Google+ API" 或 "People API"
3. 點擊啟用

### 3. 建立 OAuth 2.0 憑證
1. 左側選單 → API 和服務 → 憑證
2. 建立憑證 → OAuth 用戶端 ID
3. 應用程式類型: 網頁應用程式
4. 名稱: LoginDemo Backend
5. 已授權的 JavaScript 來源:
   ```
   http://localhost:4000
   ```
6. 已授權的重新導向 URI:
   ```
   http://localhost:4000/user/auth/google/callback
   ```
7. 建立後會得到:
   - Client ID
   - Client Secret
8. 複製到 `.env` 檔案

### 4. 設定 OAuth 同意畫面
1. 左側選單 → OAuth 同意畫面
2. 使用者類型: 外部
3. 填寫應用程式資訊:
   - 應用程式名稱: LoginDemo
   - 使用者支援電子郵件: 你的 email
   - 開發人員聯絡資訊: 你的 email
4. Scopes: 新增
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. 測試使用者: 新增你的測試 Google 帳號
6. 儲存並繼續

### 5. 驗證設定

確認以下項目都已完成:
- ✅ OAuth 用戶端 ID 已建立
- ✅ 回調 URL 設定正確
- ✅ OAuth 同意畫面已設定
- ✅ 測試使用者已新增
- ✅ Client ID 和 Secret 已複製到 .env

---

## 🎓 進階功能建議

### 1. 整合更多第三方登入
- GitHub OAuth
- Facebook Login
- Line Login
- Discord OAuth

### 2. 完善的會員系統
- Email 驗證 (寄送驗證信)
- 忘記密碼 / 重設密碼
- 個人資料編輯
- 頭像上傳 (Multer + Cloudinary)
- 帳號綁定 (連結多個第三方帳號)

### 3. 權限管理
- 角色系統 (admin, user, guest)
- 權限檢查中介層
- 資源存取控制 (RBAC)

### 4. 安全強化
- Rate Limiting (防止暴力破解) - `express-rate-limit`
- Refresh Token 機制
- CSRF Protection - `csurf`
- XSS Protection - `helmet`
- SQL Injection 防護 - Mongoose 已內建

### 5. 效能優化
- Redis 快取 (儲存 session)
- Token 黑名單 (已登出的 token)
- 資料庫索引優化

---

## 📖 相關資源

### 官方文件
- [Passport.js 官方文件](http://www.passportjs.org/)
- [Passport Google OAuth 2.0 策略](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [JWT 介紹](https://jwt.io/)
- [Mongoose 文件](https://mongoosejs.com/)
- [Express.js 官方文件](https://expressjs.com/)

### 教學文章
- [理解 OAuth 2.0](https://www.oauth.com/)
- [JWT vs Session](https://stackoverflow.com/questions/43452896/authentication-jwt-usage-vs-session)

---

## ✅ 實作檢查清單

完成後請逐項確認:

### 環境設定
- [x] 已安裝 `passport-google-oauth20` ✅
- [x] .env 已設定所有環境變數 ✅ (包含 JWT_SECRET, MONGODB_URI, Google OAuth 憑證等)
- [x] MongoDB 已啟動 ✅ (使用 MongoDB Atlas 雲端資料庫)
- [x] Google Console 已設定完成 ✅

### 檔案建立
- [x] models/user.js 已建立，包含所有必要欄位 ✅
- [x] middlewares/auth.js 已建立 ✅
- [x] controllers/userController.js 已建立所有函數 ✅ (包含 getProfile, refreshToken, logout, logoutAll, googleAuthCallback)
- [x] routers/user.js 已建立所有路由 ✅

### 檔案修改
- [x] passport.js 已新增 Google 策略 ✅ (同時包含 JWT 策略)
- [x] index.js 已連接 MongoDB ✅
- [x] index.js 已初始化 Passport ✅
- [x] index.js 已掛載 user router ✅

### 功能測試
- [x] 可以成功導向 Google 登入頁面 ✅
- [x] Google 授權後可以正確回調 ✅
- [x] Token 有正確生成並存入資料庫 ✅
- [x] 可以用 token 取得個人資料 ✅
- [x] 可以更新 token (refresh token 功能) ✅ (已使用 curl 測試成功)
- [x] 更新 token 時允許使用過期的 token ✅ (passport JWT 策略設定 ignoreExpiration: true)
- [x] 可以正常登出當前裝置 (token 被移除) ✅
- [x] 可以登出所有裝置 (清空所有 tokens) ✅
- [x] 同一 email 的多次登入會是同一使用者 ✅

### 錯誤處理
- [x] Google 認證失敗有適當處理 ✅ (failureRedirect 重導向至前端錯誤頁面)
- [x] JWT 驗證失敗有適當錯誤訊息 ✅ (auth.js 中處理各種錯誤情況)
- [x] 資料庫錯誤有適當處理 ✅ (所有 controller 都有 try-catch)
- [x] 所有 API 都有錯誤處理機制 ✅

### 備註說明
- **passport-local 策略**: 已安裝套件但未實作,因為本專案僅使用 Google OAuth 登入,不需要傳統 email/password 登入功能
- **測試方式**: 由於 Postman 客戶端問題,已改用 curl 和 VS Code REST Client 進行測試
- **Token 有效期**: 設定為 3 分鐘 (expiresIn: '3m'),適合開發測試,生產環境建議改為 7 天或更長
- **資料庫**: 使用 MongoDB Atlas 雲端資料庫,連線穩定
- **伺服器 Port**: 4000 (index.js:62)

---

## 🎉 完成!

實作完成後，你將擁有一個完整的 Google OAuth 2.0 登入系統，支援:
- ✅ Google 快速登入
- ✅ JWT 認證機制
- ✅ Token 刷新機制 (Refresh Token)
- ✅ 多裝置登入管理
- ✅ 單一裝置登出
- ✅ 所有裝置登出
- ✅ 完善的錯誤處理
- ✅ 可擴展的架構設計

可以開始根據這份計畫逐步實作各個檔案!

---

## 🧪 測試工具建議

如果遇到 Postman 卡住的問題,建議使用以下替代工具:

1. **curl** - 命令列工具,最快速直接
2. **VS Code REST Client** - 在 VS Code 中直接測試 API
3. **Thunder Client** - VS Code 擴充套件,類似 Postman
4. **Insomnia** - 免費的 API 測試工具
5. **Postman Web 版本** - https://web.postman.co/

建立 `tests/api-test.http` 方便快速測試:
```http
@baseUrl = http://localhost:4000
@token = YOUR_TOKEN_HERE

### 測試 Google 登入
GET {{baseUrl}}/user/auth/google

### 測試取得個人資料
GET {{baseUrl}}/user/profile
Authorization: Bearer {{token}}

### 測試更新 Token
POST {{baseUrl}}/user/refresh
Authorization: Bearer {{token}}
Content-Type: application/json

### 測試登出
POST {{baseUrl}}/user/logout
Authorization: Bearer {{token}}

### 測試登出所有裝置
POST {{baseUrl}}/user/logout/all
Authorization: Bearer {{token}}
```

---

**最後更新:** 2025-10-25
**作者:** Claude
**版本:** 1.1
**變更紀錄:**
- 新增 Refresh Token 功能說明
- 新增 Postman 卡住問題的疑難排解
- 新增替代測試工具建議
- 更新路由表和測試範例
