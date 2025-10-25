# Google OAuth 設定指南

## ❌ 常見錯誤: redirect_uri_mismatch

如果你看到以下錯誤:
```
錯誤 400: redirect_uri_mismatch
這個應用程式不符合 Google 的 OAuth 2.0 政策規定，因此您無法登入。
```

這表示 Google Cloud Console 中的重新導向 URI 設定不正確。

---

## 🔧 解決步驟

### 步驟 1: 前往 Google Cloud Console

1. 訪問: https://console.cloud.google.com/
2. 登入你的 Google 帳號
3. 選擇專案: `test-logindemo` (或你的專案名稱)

---

### 步驟 2: 進入憑證頁面

1. 在左側選單中，點擊 `API和服務` → `憑證`
2. 或直接訪問: https://console.cloud.google.com/apis/credentials

---

### 步驟 3: 找到你的 OAuth 2.0 用戶端 ID

1. 在「OAuth 2.0 用戶端 ID」區段
2. 找到你的用戶端 ID (Client ID 開頭應該是 `155418329479-...`)
3. 點擊右側的 **編輯圖示** (鉛筆圖示)

---

### 步驟 4: 設定已授權的重新導向 URI

在「已授權的重新導向 URI」區段:

#### ✅ 必須加入以下 URI:

```
http://localhost:4000/user/auth/google/callback
http://127.0.0.1:4000/user/auth/google/callback
```

#### 為什麼需要兩個?
- `localhost` 和 `127.0.0.1` 在 Google 看來是不同的網址
- 加入兩個可以確保兼容性

#### 如果是生產環境:
```
https://yourdomain.com/user/auth/google/callback
```
⚠️ **生產環境必須使用 HTTPS!**

---

### 步驟 5: 儲存變更

1. 點擊頁面底部的 **「儲存」** 按鈕
2. 等待幾秒鐘讓設定生效

---

## 🧪 驗證設定

### 方法 1: 在瀏覽器測試

1. 訪問: `http://localhost:4000/user/auth/google`
2. 應該會成功導向 Google 登入頁面
3. 登入後應該會重導向回你的前端: `http://localhost:3000/auth/callback?token=...`

### 方法 2: 檢查錯誤訊息

如果還是看到錯誤，檢查錯誤訊息中的 `redirect_uri`:
```
要求詳情: redirect_uri=http://localhost:4000/user/auth/google/callback
```

確保這個 URI **完全一致**地出現在 Google Cloud Console 的設定中。

---

## 📋 完整的 Google Cloud Console 設定檢查清單

### OAuth 2.0 用戶端 ID 設定:

- [x] **應用程式類型**: 網頁應用程式
- [x] **名稱**: 任意名稱 (例如: "LoginDemo Web Client")
- [x] **已授權的 JavaScript 來源** (可選):
  ```
  http://localhost:3000
  ```
- [x] **已授權的重新導向 URI** (必填):
  ```
  http://localhost:4000/user/auth/google/callback
  http://127.0.0.1:4000/user/auth/google/callback
  ```

### OAuth 同意畫面設定:

- [x] **應用程式名稱**: LoginDemo (或你的應用名稱)
- [x] **使用者支援電子郵件**: 你的 email
- [x] **授權網域**: `localhost` (開發環境)
- [x] **應用程式首頁**: `http://localhost:3000` (可選)
- [x] **應用程式隱私權政策連結**: (可選，測試階段可不填)
- [x] **應用程式服務條款連結**: (可選，測試階段可不填)
- [x] **範圍 (Scopes)**:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`

---

## ⚠️ 常見問題

### Q1: 我已經新增了 URI，但還是出現錯誤?
**A:** 等待幾分鐘讓 Google 的設定生效，然後清除瀏覽器快取重試。

### Q2: 我該使用 `localhost` 還是 `127.0.0.1`?
**A:** 兩個都加入，確保兼容性。

### Q3: 為什麼不能在 Postman 測試 Google 登入?
**A:** Google OAuth 需要在瀏覽器中完成，因為:
- 需要 Google 登入頁面 (視覺化介面)
- 需要 Cookie 和 Session 管理
- 需要處理重導向

**正確做法:**
1. 在**瀏覽器**中訪問 `http://localhost:4000/user/auth/google`
2. 完成登入後複製 token
3. 在 Postman 中使用該 token 測試其他 API

### Q4: 測試時出現「這個應用程式尚未經過驗證」
**A:** 這是正常的，因為你的應用還在開發階段。
- 點擊「進階」
- 點擊「前往 logindemo（不安全）」
- 只有在測試階段才這樣做!

### Q5: 生產環境需要什麼設定?
**A:**
1. 必須使用 HTTPS
2. 需要驗證你的應用程式
3. 重新導向 URI 要改成你的網域:
   ```
   https://yourdomain.com/user/auth/google/callback
   ```
4. 更新 `.env`:
   ```
   GOOGLE_CALLBACK_URL=https://yourdomain.com/user/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

---

## 🔍 除錯技巧

### 查看完整的錯誤訊息
當出現錯誤時，查看 URL 中的錯誤參數:
```
https://accounts.google.com/signin/oauth/error?authError=...
```

### 檢查後端日誌
查看你的後端 console，應該會顯示:
```
Google Profile: { ... }
已建立新使用者 (Google 登入)
或
已將 Google 帳號綁定到現有使用者
```

### 使用 Google OAuth Playground
測試你的 Client ID 和 Secret:
https://developers.google.com/oauthplayground/

---

## 📚 相關資源

- [Google OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

## ✅ 設定完成後

確認以下項目都正常:
- [ ] Google Cloud Console 設定已儲存
- [ ] 重新導向 URI 包含 localhost 和 127.0.0.1
- [ ] 後端伺服器正在運行
- [ ] `.env` 的 GOOGLE_CALLBACK_URL 與 Console 設定一致
- [ ] 在瀏覽器中訪問 `/user/auth/google` 不再出現錯誤
- [ ] 可以成功登入並取得 token

完成後就可以開始測試其他 API 了! 🎉
