# Postman 測試指南

## 📥 方法 1: 導入 Postman Collection (推薦)

### 步驟 1: 導入 Collection
1. 打開 Postman
2. 點擊左上角 "Import" 按鈕
3. 選擇 `postman-collection.json` 文件
4. 點擊 "Import"

### 步驟 2: 設定變數
1. 點擊 Collection "Google Login API"
2. 切換到 "Variables" 標籤
3. 確認 `baseUrl` 為 `http://localhost:4000`
4. **稍後**將 `token` 變數設為你的真實 token

### 步驟 3: 取得 Token
1. **在瀏覽器中**訪問: `http://localhost:4000/user/auth/google`
2. 完成 Google 登入
3. 瀏覽器會重導向到: `http://localhost:3000/auth/callback?token=eyJhbG...`
4. **複製 `token=` 後面的所有內容**

### 步驟 4: 設定 Token
1. 回到 Postman
2. 點擊 Collection "Google Login API"
3. 切換到 "Variables" 標籤
4. 將 `token` 的 "Current value" 設為你複製的 token
5. 點擊 "Save"

### 步驟 5: 開始測試
依序執行以下請求:
1. ✅ 測試 404 路由 (不需要 token)
2. ✅ 取得個人資料 (無 Token) - 應該失敗
3. ✅ 取得個人資料 (有 Token) - 應該成功
4. ✅ 更新 Token
5. ✅ 登出

---

## 📝 方法 2: 手動建立請求

### 請求 1: 測試 404 (不需要 Token)

```
方法: GET
URL: http://localhost:4000/test-not-found
```

**預期結果:**
```json
{
  "success": false,
  "message": "找不到該路由"
}
```

---

### 請求 2: 取得個人資料 (需要 Token)

```
方法: GET
URL: http://localhost:4000/user/profile

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**如何設定 Header:**
1. 切換到 "Headers" 標籤
2. 新增一個 Key-Value:
   - Key: `Authorization`
   - Value: `Bearer {你的token}` (注意 Bearer 後面有空格)

**預期結果 (成功):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "user@gmail.com",
    "displayName": "User Name",
    "avatar": "https://...",
    "googleId": "123456",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 請求 3: 更新 Token

```
方法: POST
URL: http://localhost:4000/user/refresh

Headers:
Authorization: Bearer {你的token}
Content-Type: application/json
```

**預期結果:**
```json
{
  "success": true,
  "message": "Token 更新成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**重要:** 記得用新的 token 替換舊的!

---

### 請求 4: 登出

```
方法: POST
URL: http://localhost:4000/user/logout

Headers:
Authorization: Bearer {你的token}
Content-Type: application/json
```

**預期結果:**
```json
{
  "success": true,
  "message": "登出成功"
}
```

**注意:** 登出後,這個 token 就無法再使用了!

---

### 請求 5: 登出所有裝置

```
方法: POST
URL: http://localhost:4000/user/logout/all

Headers:
Authorization: Bearer {你的token}
Content-Type: application/json
```

**預期結果:**
```json
{
  "success": true,
  "message": "已登出所有裝置"
}
```

**注意:** 這會清空所有 tokens,所有裝置都需要重新登入!

---

## ⚠️ 常見錯誤訊息說明

### 1. "No auth token"
**原因:** 沒有提供 Authorization header
**解決方法:** 確認你有在 Headers 中加入 `Authorization: Bearer {token}`

### 2. "jwt malformed"
**原因:** Token 格式不正確
**解決方法:**
- 確認 token 前面有 `Bearer ` (注意空格)
- 確認 token 是完整的,沒有被截斷
- 確認沒有多餘的空格或換行

### 3. "使用者不存在或 token 已失效"
**原因:** Token 已被登出或使用者被刪除
**解決方法:** 重新登入取得新的 token

### 4. "token 已過期"
**原因:** Token 超過 7 天有效期
**解決方法:** 使用 `/user/refresh` 端點更新 token,或重新登入

---

## 🔍 完整測試流程

### 第一次測試 (完整流程)

1. ✅ **測試 404** - 確認伺服器正常運行
   ```
   GET http://localhost:4000/test-not-found
   ```

2. ✅ **測試無 Token 訪問** - 確認授權保護有效
   ```
   GET http://localhost:4000/user/profile
   預期: 401 "No auth token"
   ```

3. ✅ **取得 Token** - 在瀏覽器完成 Google 登入
   ```
   瀏覽器訪問: http://localhost:4000/user/auth/google
   複製返回的 token
   ```

4. ✅ **測試有 Token 訪問** - 確認認證成功
   ```
   GET http://localhost:4000/user/profile
   Header: Authorization: Bearer {token}
   預期: 200 + 個人資料
   ```

5. ✅ **測試 Refresh Token** - 確認 token 更新功能
   ```
   POST http://localhost:4000/user/refresh
   Header: Authorization: Bearer {token}
   預期: 200 + 新 token
   ```

6. ✅ **測試登出** - 確認登出功能
   ```
   POST http://localhost:4000/user/logout
   Header: Authorization: Bearer {token}
   預期: 200 "登出成功"
   ```

7. ✅ **確認 Token 已失效** - 再次嘗試訪問
   ```
   GET http://localhost:4000/user/profile
   Header: Authorization: Bearer {剛才的token}
   預期: 401 "使用者不存在或 token 已失效"
   ```

---

## 💡 小技巧

### 使用環境變數 (Environment)
1. 在 Postman 中建立一個 Environment
2. 新增變數:
   - `baseUrl`: `http://localhost:4000`
   - `token`: (你的 token)
3. 在請求中使用 `{{baseUrl}}` 和 `{{token}}`
4. 這樣切換環境時會更方便!

### 自動更新 Token
你可以在 Refresh Token 請求的 "Tests" 標籤中加入:
```javascript
// 自動將新 token 儲存到環境變數
const response = pm.response.json();
if (response.success && response.token) {
    pm.environment.set("token", response.token);
}
```

### 儲存測試結果
使用 Postman 的 Collection Runner 可以批次執行所有測試並產生報告!

---

## 🎯 快速測試檢查清單

- [ ] 伺服器已啟動 (`npm run dev`)
- [ ] MongoDB 連線成功
- [ ] 可以訪問 404 路由
- [ ] 無 Token 訪問被拒絕
- [ ] Google 登入成功取得 Token
- [ ] 使用 Token 可以取得個人資料
- [ ] Refresh Token 功能正常
- [ ] 登出功能正常
- [ ] 登出後 Token 失效

---

需要幫助嗎?請參考 [test-commands.md](./test-commands.md) 查看其他測試方法!
