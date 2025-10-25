# 後端 API 測試指令

## 使用 curl 測試

### 1. 測試伺服器是否正常運行 (測試 404 路由)
```bash
curl http://localhost:4000/test
```
預期回應:
```json
{"success":false,"message":"找不到該路由"}
```

### 2. 測試 Google 登入導向
```bash
curl -i http://localhost:4000/user/auth/google
```
預期回應: 會重導向到 Google 登入頁面 (302 redirect)

### 3. 測試取得個人資料 (無 token - 應該失敗)
```bash
curl http://localhost:4000/user/profile
```
預期回應:
```json
{"success":false,"message":"No auth token"}
```

### 4. 測試取得個人資料 (有 token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:4000/user/profile
```

### 5. 測試登出
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:4000/user/logout
```

### 6. 測試登出所有裝置
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:4000/user/logout/all
```

---

## 使用 PowerShell 測試 (Windows)

### 1. 測試伺服器是否正常運行
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/test" -Method Get
```

### 2. 測試取得個人資料 (無 token)
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/user/profile" -Method Get
```

### 3. 測試取得個人資料 (有 token)
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:4000/user/profile" -Method Get -Headers $headers
```

### 4. 測試登出
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:4000/user/logout" -Method Post -Headers $headers
```

---

## 使用 Postman 或 Insomnia 測試

### API 端點列表:

1. **Google 登入導向**
   - 方法: `GET`
   - URL: `http://localhost:4000/user/auth/google`

2. **取得個人資料**
   - 方法: `GET`
   - URL: `http://localhost:4000/user/profile`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

3. **登出**
   - 方法: `POST`
   - URL: `http://localhost:4000/user/logout`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

4. **登出所有裝置**
   - 方法: `POST`
   - URL: `http://localhost:4000/user/logout/all`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

---

## 完整的 Google 登入測試流程

1. 在瀏覽器中訪問: `http://localhost:4000/user/auth/google`
2. 登入你的 Google 帳號
3. 登入成功後會重導向到: `http://localhost:3000/auth/callback?token=YOUR_TOKEN`
4. 複製 URL 中的 token
5. 使用該 token 測試其他受保護的 API

---

## 檢查 MongoDB 資料

你可以使用 MongoDB Compass 或 mongosh 連接到你的資料庫查看資料:

```
mongodb+srv://kcnfoggy54:UDN4CJVwu6qPgM7R@cluster0.vuouq7r.mongodb.net/logindemo
```
