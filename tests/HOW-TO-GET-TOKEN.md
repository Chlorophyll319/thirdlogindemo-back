# 如何取得真實的 JWT Token 進行測試

## 🎯 目標
取得一個真實有效的 JWT token,用於測試受保護的 API 端點。

---

## 📋 完整步驟

### 步驟 1: 確認後端伺服器運行中

```bash
# 在終端檢查
curl http://localhost:4000/test-404

# 應該回傳:
# {"success":false,"message":"找不到該路由"}
```

如果沒有回應,請啟動伺服器:
```bash
cd back
npm run dev
```

---

### 步驟 2: 在瀏覽器中完成 Google 登入

**重要:** 必須使用**瀏覽器**,不能用 Postman!

1. **開啟瀏覽器** (建議使用無痕模式)
   ```
   Chrome: Ctrl + Shift + N
   ```

2. **訪問登入 URL**
   ```
   http://localhost:4000/user/auth/google
   ```

3. **完成 Google 登入**
   - 選擇你的 Google 帳號
   - 如果看到「這個應用程式尚未經過驗證」:
     - 點擊「進階」
     - 點擊「前往 logindemo（不安全）」
   - 同意授權

4. **等待重導向**
   - 登入成功後會重導向到前端
   - URL 類似:
     ```
     http://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - 即使前端不存在也沒關係,我們只需要 token

---

### 步驟 3: 複製 Token

從瀏覽器的網址列複製 token:

**完整 URL:**
```
http://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzFhYjQ4YzU1ZTQ3OTAwMTNlMzY0NjMiLCJpYXQiOjE3Mjk4MzQ3MjQsImV4cCI6MTczMDQzOTUyNH0.abc123def456...
```

**只複製 `token=` 後面的部分:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzFhYjQ4YzU1ZTQ3OTAwMTNlMzY0NjMiLCJpYXQiOjE3Mjk4MzQ3MjQsImV4cCI6MTczMDQzOTUyNH0.abc123def456...
```

⚠️ **注意:**
- 複製**完整的** token,直到最後
- 不要包含 `?token=` 部分
- 不要有多餘的空格或換行

---

### 步驟 4: 在 Postman 中使用 Token

#### 方法 1: 設定 Authorization Header

1. **選擇請求** (例如: GET /user/profile)

2. **切換到 Headers 標籤**

3. **新增 Header:**
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

   ⚠️ **重要:** `Bearer` 和 token 之間有一個空格!

#### 方法 2: 使用 Postman 的 Authorization 功能

1. **切換到 Authorization 標籤**

2. **Type 選擇:** `Bearer Token`

3. **Token 欄位貼上:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

   (不需要加 `Bearer`,Postman 會自動加)

---

### 步驟 5: 測試 API

**測試取得個人資料:**
```http
GET http://localhost:4000/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**預期成功回應:**
```json
{
  "success": true,
  "data": {
    "_id": "671ab48c55e4790013e36463",
    "email": "your@gmail.com",
    "displayName": "Your Name",
    "avatar": "https://...",
    "googleId": "123456789",
    "createdAt": "2025-10-25T...",
    "updatedAt": "2025-10-25T..."
  }
}
```

---

## 🔍 常見錯誤排查

### 錯誤 1: "jwt malformed"

**原因:** Token 格式不正確

**檢查:**
- ✅ Token 是否完整?
- ✅ 是否有 `Bearer ` 前綴?
- ✅ `Bearer` 後面是否有空格?
- ✅ 是否有多餘的引號或空格?

**錯誤示例:**
```
❌ Authorization: eyJhbGciOi...          (缺少 Bearer)
❌ Authorization: Bearer"eyJhbGci...     (多了引號)
❌ Authorization: BearereyJhbGci...      (缺少空格)
❌ Authorization: Bearer eyJhbGci        (token 被截斷)
```

**正確示例:**
```
✅ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 錯誤 2: "No auth token"

**原因:** 沒有提供 Authorization header

**解決:** 確認已經在 Headers 中加入 `Authorization`

---

### 錯誤 3: "使用者不存在或 token 已失效"

**原因:** Token 已經被登出或使用者被刪除

**解決:** 重新完成 Google 登入取得新 token

---

### 錯誤 4: "token 已過期"

**原因:** Token 超過 7 天有效期

**解決:**
1. 使用 `/user/refresh` 更新 token
2. 或重新登入取得新 token

---

## 💡 快速測試腳本

如果你想用命令列快速測試,可以使用 curl:

### 1. 先取得 token (在瀏覽器)
訪問: `http://localhost:4000/user/auth/google`

### 2. 複製 token 後使用 curl
```bash
# 設定 token 變數
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 測試取得個人資料
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/user/profile

# 測試更新 token
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:4000/user/refresh

# 測試登出
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:4000/user/logout
```

---

## 🎯 完整的測試檢查清單

- [ ] 後端伺服器正在運行
- [ ] 在瀏覽器訪問 `/user/auth/google`
- [ ] 成功完成 Google 登入
- [ ] 瀏覽器重導向到帶有 token 的 URL
- [ ] 複製 token (不包含 `?token=`)
- [ ] 在 Postman 設定 Authorization header
- [ ] 格式: `Bearer {token}` (注意空格)
- [ ] 測試 API 成功回傳資料

---

## 📸 視覺化說明

### Token 的結構

一個標準的 JWT token 分為三部分,用 `.` 分隔:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    ← Header
.
eyJfaWQiOiI2NzFhYjQ4YzU1ZTQ3OTAwMTNlMzY0NjMiLCJpYXQiOjE3Mjk4MzQ3MjQsImV4cCI6MTczMDQzOTUyNH0    ← Payload
.
abc123def456ghi789...                    ← Signature
```

### 完整的 Token 範例

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzFhYjQ4YzU1ZTQ3OTAwMTNlMzY0NjMiLCJpYXQiOjE3Mjk4MzQ3MjQsImV4cCI6MTczMDQzOTUyNH0.KqE8gYJ5T8a0pQu9xMwZvN2LrHbFjD3kS6iC1mX4nY0
```

這是一個**非常長**的字串,確保複製完整!

---

## 🔧 除錯工具

### 1. 使用 JWT.io 驗證 Token

訪問: https://jwt.io/

貼上你的 token,可以看到:
- Header (演算法)
- Payload (使用者 ID, 過期時間)
- Signature (需要 secret 驗證)

### 2. 檢查 Token 是否過期

在 JWT.io 的 Payload 中查看:
```json
{
  "_id": "671ab48c55e4790013e36463",
  "iat": 1729834724,    ← 發行時間
  "exp": 1730439524     ← 過期時間
}
```

將 `exp` 轉換成日期:
```javascript
new Date(1730439524 * 1000)
// 結果: 2025-11-01T...
```

---

## ✅ 成功標誌

當你成功使用 token 後,應該看到:

**Postman 回應:**
```json
{
  "success": true,
  "data": {
    "email": "your@gmail.com",
    "displayName": "Your Name",
    ...
  }
}
```

**後端 Console:**
```
(沒有錯誤訊息,或顯示成功的操作日誌)
```

---

## 📚 相關文件

- [Postman 測試指南](./POSTMAN-GUIDE.md)
- [Google OAuth 設定](./GOOGLE-OAUTH-SETUP.md)
- [API 測試命令](./test-commands.md)

---

**最後更新:** 2025-10-25
**適用版本:** LoginDemo v1.0.0
