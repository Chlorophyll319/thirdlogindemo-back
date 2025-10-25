/**
 * 快速測試後端 API
 * 使用方法: node quick-test.js
 */

const BASE_URL = 'http://localhost:4000'

// 測試函數
async function testAPI(name, url, options = {}) {
  try {
    console.log(`\n📝 測試: ${name}`)
    console.log(`🔗 URL: ${url}`)

    const response = await fetch(url, options)
    const data = await response.json()

    console.log(`✅ 狀態碼: ${response.status}`)
    console.log(`📦 回應:`, JSON.stringify(data, null, 2))

    return { success: true, status: response.status, data }
  } catch (error) {
    console.error(`❌ 錯誤:`, error.message)
    return { success: false, error: error.message }
  }
}

// 主測試函數
async function runTests() {
  console.log('🚀 開始測試後端 API...\n')
  console.log('=' .repeat(60))

  // 測試 1: 未定義的路由 (應該回傳 404)
  await testAPI(
    '未定義的路由 (預期 404)',
    `${BASE_URL}/test-not-found`
  )

  console.log('\n' + '='.repeat(60))

  // 測試 2: 測試無 token 的受保護路由 (應該回傳 401)
  await testAPI(
    '無 token 訪問受保護路由 (預期 401)',
    `${BASE_URL}/user/profile`
  )

  console.log('\n' + '='.repeat(60))

  // 測試 3: 測試無效的 token (應該回傳 401)
  await testAPI(
    '使用無效 token (預期 401)',
    `${BASE_URL}/user/profile`,
    {
      headers: {
        'Authorization': 'Bearer invalid_token_here'
      }
    }
  )

  console.log('\n' + '='.repeat(60))

  // 測試 4: 測試 Google 登入導向
  await testAPI(
    'Google 登入導向 (預期 302 重導向)',
    `${BASE_URL}/user/auth/google`
  )

  console.log('\n' + '='.repeat(60))
  console.log('\n✅ 基本測試完成!')
  console.log('\n💡 提示:')
  console.log('   1. 要測試完整的 Google 登入流程,請在瀏覽器訪問:')
  console.log('      http://localhost:4000/user/auth/google')
  console.log('   2. 登入成功後會得到一個 token')
  console.log('   3. 使用該 token 可以測試其他受保護的 API')
  console.log('   4. 範例: 在下方加入你的 token 並取消註解來測試\n')
  console.log('   // const token = "你的_TOKEN_放這裡"')
  console.log('   // await testAPI("取得個人資料", `${BASE_URL}/user/profile`, {')
  console.log('   //   headers: { "Authorization": `Bearer ${token}` }')
  console.log('   // })\n')
}

// 執行測試
runTests().catch(console.error)
