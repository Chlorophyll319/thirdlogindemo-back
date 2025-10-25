# Google OAuth 疑難排解指南

## 🔴 錯誤: redirect_uri_mismatch (已設定 URI 但仍然失敗)

如果你已經在 Google Cloud Console 中正確設定了重新導向 URI,但仍然看到錯誤,請按照以下步驟排查:

---

## ✅ 檢查清單

### 步驟 1: 確認 OAuth 2.0 用戶端 ID 設定

前往: https://console.cloud.google.com/apis/credentials

#### 已授權的 JavaScript 來源:
```
http://localhost:4000
```

#### 已授權的重新導向 URI:
```
http://localhost:4000/user/auth/google/callback
http://127.0.0.1:4000/user/auth/google/callback
```

⚠️ **注意:**
- 不要有多餘的空格
- 不要有尾隨的斜線 `/`
- 確保協定是 `http://` (開發環境)

---

### 步驟 2: 檢查 OAuth 同意畫面設定

前往: https://console.cloud.google.com/apis/credentials/consent

#### 必須設定的項目:

1. **應用程式名稱**:
   - 填寫: `LoginDemo` (或任意名稱)

2. **使用者支援電子郵件**:
   - 選擇你的 Google 帳號

3. **開發人員聯絡資訊**:
   - 填寫你的 email

4. **發布狀態**:
   - 如果是測試階段,選擇 **「測試」**
   - 在「測試使用者」中加入你的 Google 帳號

5. **範圍 (Scopes)**:
   - 確保包含以下範圍:
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
   - 或在「非敏感範圍」中自動包含

---

### 步驟 3: 確認專案 ID 和 Client ID

#### 檢查你使用的 Client ID:

在 `.env` 文件中:
```
GOOGLE_CLIENT_ID=155418329479-q44plgvfe35e34m7lhduoki0cnacs6ub.apps.googleusercontent.com
```

在 Google Cloud Console 中:
1. 前往憑證頁面
2. 找到對應的 OAuth 2.0 用戶端 ID
3. 確認 Client ID 完全一致

⚠️ **如果有多個 Client ID,確保編輯的是正確的那一個!**

---

### 步驟 4: 等待設定生效

Google Cloud Console 的變更可能需要時間生效:

1. **儲存設定後**
2. **等待 2-5 分鐘**
3. **清除瀏覽器快取**:
   - Chrome: `Ctrl + Shift + Delete`
   - 選擇「Cookie 和其他網站資料」
   - 清除
4. **重新測試**

---

### 步驟 5: 檢查後端設定

#### 檢查 `.env` 文件:

```bash
# 確認這些設定正確
GOOGLE_CLIENT_ID=你的Client_ID
GOOGLE_CLIENT_SECRET=你的Client_Secret
GOOGLE_CALLBACK_URL=http://localhost:4000/user/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

#### 確認後端伺服器已重啟:

如果你修改了 `.env`,需要重啟伺服器:
```bash
# 停止伺服器 (Ctrl + C)
# 重新啟動
npm run dev
```

---

### 步驟 6: 使用正確的測試方法

#### ❌ 錯誤的測試方法:
- 在 Postman 中直接測試 `/user/auth/google`
- 原因: OAuth 需要瀏覽器互動

#### ✅ 正確的測試方法:
1. **在瀏覽器中**訪問: `http://localhost:4000/user/auth/google`
2. 完成 Google 登入
3. 從重導向 URL 複製 token
4. 在 Postman 中使用 token 測試其他 API

---

## 🔧 詳細除錯步驟

### 檢查重導向 URL

在錯誤訊息中,查看「要求詳情」部分:
```
redirect_uri=http://localhost:4000/user/auth/google/callback
```

確保這個 URL **完全一致**地出現在 Google Cloud Console 的「已授權的重新導向 URI」列表中。

### 檢查後端日誌

啟動後端時應該看到:
```
伺服器啟動
✅ MongoDB 連線成功
```

當你訪問 Google 登入時,如果成功會看到:
```
Google Profile: { id: '...', displayName: '...', emails: [...] }
Google 登入成功: your@email.com
```

---

## 🎯 完整測試流程

### 1. 確認設定已儲存
- [x] Google Cloud Console 設定已儲存
- [x] `.env` 設定正確
- [x] 後端伺服器已重啟

### 2. 清除瀏覽器快取
```
Chrome: Ctrl + Shift + Delete
選擇「Cookie 和其他網站資料」
點擊「清除資料」
```

### 3. 測試後端連線
```bash
curl http://localhost:4000/test-404
# 應該回傳: {"success":false,"message":"找不到該路由"}
```

### 4. 在瀏覽器測試 Google 登入
```
訪問: http://localhost:4000/user/auth/google
```

#### 預期流程:
1. 重導向到 Google 登入頁面 ✅
2. 選擇/登入 Google 帳號 ✅
3. 同意授權 (如果是第一次) ✅
4. 重導向回前端: `http://localhost:3000/auth/callback?token=...` ✅

---

## ⚠️ 常見錯誤情境

### 情境 1: 測試使用者未設定

**錯誤:** 「存取遭拒:」或「Access blocked」

**解決方法:**
1. 前往 OAuth 同意畫面設定
2. 在「測試使用者」區段
3. 點擊「+ ADD USERS」
4. 加入你的測試 Google 帳號
5. 儲存

---

### 情境 2: 應用程式未驗證

**錯誤:** 「這個應用程式尚未經過驗證」

**解決方法:** (僅限開發測試)
1. 點擊「進階」
2. 點擊「前往 logindemo（不安全）」
3. 繼續授權流程

⚠️ **生產環境必須完成應用程式驗證!**

---

### 情境 3: Scope 權限不足

**錯誤:** 無法取得 email 或 profile

**解決方法:**
1. 檢查 OAuth 同意畫面的「範圍」設定
2. 確保包含:
   - `userinfo.email`
   - `userinfo.profile`
3. 如果修改了範圍,需要重新授權

---

### 情境 4: 多個 OAuth Client

**錯誤:** 設定了 URI 但仍然不匹配

**原因:** 你可能有多個 OAuth 2.0 用戶端 ID,編輯了錯誤的那個

**解決方法:**
1. 在 Google Cloud Console 的憑證頁面
2. 查看所有的 OAuth 2.0 用戶端 ID
3. 找到與 `.env` 中 `GOOGLE_CLIENT_ID` 相符的那個
4. 編輯**正確的** Client ID

---

## 🔍 使用開發者工具除錯

### Chrome DevTools

1. 打開瀏覽器開發者工具: `F12`
2. 切換到「Network」標籤
3. 勾選「Preserve log」
4. 訪問 `http://localhost:4000/user/auth/google`
5. 觀察網路請求:
   - 應該看到 302 重導向到 Google
   - 檢查 `redirect_uri` 參數是否正確

### 檢查實際的重導向 URL

在 Chrome DevTools 的 Network 標籤中:
1. 找到 `/user/auth/google` 請求
2. 查看「Headers」→「Location」
3. 應該看到類似:
```
https://accounts.google.com/o/oauth2/v2/auth?
  response_type=code&
  redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fuser%2Fauth%2Fgoogle%2Fcallback&
  scope=profile%20email&
  client_id=155418329479-...
```

4. 複製 `redirect_uri` 的值並 URL decode
5. 確認它與 Google Cloud Console 的設定完全一致

---

## 🎓 最佳實踐

### 開發環境設定

```env
# .env (開發環境)
GOOGLE_CALLBACK_URL=http://localhost:4000/user/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

Google Cloud Console:
```
已授權的 JavaScript 來源:
- http://localhost:4000

已授權的重新導向 URI:
- http://localhost:4000/user/auth/google/callback
- http://127.0.0.1:4000/user/auth/google/callback
```

### 生產環境設定

```env
# .env (生產環境)
GOOGLE_CALLBACK_URL=https://yourdomain.com/user/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

Google Cloud Console:
```
已授權的 JavaScript 來源:
- https://yourdomain.com

已授權的重新導向 URI:
- https://yourdomain.com/user/auth/google/callback
```

---

## 📞 還是無法解決?

### 檢查以下項目:

1. **專案是否正確**
   - 確認在 Google Cloud Console 中選擇了正確的專案

2. **API 是否啟用**
   - 前往「API 和服務」→「已啟用的 API 和服務」
   - 確認「Google+ API」或「People API」已啟用

3. **憑證是否有效**
   - 確認 Client ID 和 Secret 沒有過期或被撤銷

4. **防火牆設定**
   - 確認 localhost:4000 沒有被防火牆阻擋

### 重建 OAuth Client (最後手段)

如果以上都無法解決,考慮重新建立 OAuth 2.0 用戶端 ID:

1. 在 Google Cloud Console 刪除現有的 OAuth Client
2. 建立新的「網頁應用程式」Client
3. 設定正確的重新導向 URI
4. 更新 `.env` 中的 Client ID 和 Secret
5. 重啟後端伺服器
6. 重新測試

---

## ✅ 成功的標誌

當設定正確時,你應該看到:

1. **瀏覽器**:
   - 成功導向到 Google 登入頁面
   - 登入後重導向到前端並帶有 token

2. **後端 Console**:
   ```
   Google Profile: {
     id: '123456789',
     displayName: 'Your Name',
     emails: [ { value: 'your@email.com', verified: true } ]
   }
   已建立新使用者 (Google 登入)
   或
   已將 Google 帳號綁定到現有使用者
   Google 登入成功: your@email.com
   ```

3. **前端 URL**:
   ```
   http://localhost:3000/auth/callback?token=eyJhbGci...
   ```

---

## 📚 相關資源

- [Google OAuth 2.0 錯誤碼](https://developers.google.com/identity/protocols/oauth2/web-server#error-codes)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

**最後更新:** 2025-10-25