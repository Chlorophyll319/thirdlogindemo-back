# 使用 Node.js 官方映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製所有應用文件
COPY . .

# 暴露 PORT 4000
EXPOSE 4000

# 啟動應用
CMD ["npm", "start"]
