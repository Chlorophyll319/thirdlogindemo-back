# 後端測試文件

這個資料夾包含所有用於測試後端 API 的文件。

## 📁 文件說明

### 1. test-api.rest
REST Client 測試文件,可在 VS Code 中直接執行 API 請求。

**使用方法:**
1. 安裝 VS Code 擴充套件: "REST Client"
2. 打開 `test-api.rest` 文件
3. 點擊每個請求上方的 "Send Request" 按鈕

### 2. test-commands.md
包含各種測試指令的參考文件:
- curl 命令範例
- PowerShell 命令範例
- Postman/Insomnia 設定說明
- 完整的 Google 登入測試流程

### 3. quick-test.js
快速測試腳本,可以一次性執行多個基本測試。

**使用方法:**
```bash
# 在 back 目錄下執行
cd ..
node tests/quick-test.js
```

或從 tests 目錄執行:
```bash
node quick-test.js
```

## 🚀 快速開始

### 1. 啟動後端伺服器
```bash
cd ..
npm run dev
```

### 2. 執行基本測試
```bash
node tests/quick-test.js
```

### 3. 測試 Google 登入
在瀏覽器訪問:
```
http://localhost:4000/user/auth/google
```

## 📋 API 端點列表

| 方法 | 端點 | 說明 | 需要 Token |
|------|------|------|-----------|
| GET | `/user/auth/google` | Google 登入導向 | ❌ |
| GET | `/user/auth/google/callback` | Google 認證回調 | ❌ |
| GET | `/user/profile` | 取得個人資料 | ✅ |
| POST | `/user/refresh` | 更新 Token | ✅ (允許過期) |
| POST | `/user/logout` | 登出當前裝置 | ✅ |
| POST | `/user/logout/all` | 登出所有裝置 | ✅ |

## 💡 測試提示

1. **取得 Token**: 完成 Google 登入後,從重導向 URL 複製 token
2. **使用 Token**: 在 `test-api.rest` 中將 `@token` 變數替換為真實 token
3. **Token 過期**: 使用 `/user/refresh` 端點更新 token
4. **查看日誌**: 後端會在 console 顯示詳細的操作日誌
