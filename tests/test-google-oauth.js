/**
 * Google OAuth 端點測試腳本
 * 用於驗證後端 OAuth 配置是否正確
 */

const BASE_URL = 'http://localhost:4000'

async function testGoogleOAuth() {
  console.log('🔍 開始測試 Google OAuth 端點...\n')
  console.log('=' .repeat(60))

  try {
    // 測試 /user/auth/google 端點
    console.log('\n📝 測試: GET /user/auth/google')
    console.log(`🔗 URL: ${BASE_URL}/user/auth/google\n`)

    const response = await fetch(`${BASE_URL}/user/auth/google`, {
      redirect: 'manual' // 不自動跟隨重導向
    })

    console.log(`✅ 狀態碼: ${response.status}`)

    if (response.status === 302) {
      const location = response.headers.get('location')
      console.log(`\n🔄 重導向到: ${location}\n`)

      // 解析 URL 參數
      const url = new URL(location)
      const params = {
        response_type: url.searchParams.get('response_type'),
        redirect_uri: url.searchParams.get('redirect_uri'),
        scope: url.searchParams.get('scope'),
        client_id: url.searchParams.get('client_id')
      }

      console.log('📦 OAuth 參數:')
      console.log(JSON.stringify(params, null, 2))

      // 驗證必要參數
      console.log('\n✅ 參數驗證:')
      console.log(`  response_type: ${params.response_type ? '✅' : '❌'} ${params.response_type || '缺少!'}`)
      console.log(`  redirect_uri: ${params.redirect_uri ? '✅' : '❌'} ${params.redirect_uri || '缺少!'}`)
      console.log(`  scope: ${params.scope ? '✅' : '❌'} ${params.scope || '缺少!'}`)
      console.log(`  client_id: ${params.client_id ? '✅' : '❌'} ${params.client_id ? '存在' : '缺少!'}`)

      // 檢查是否所有參數都存在
      if (params.response_type && params.redirect_uri && params.scope && params.client_id) {
        console.log('\n🎉 所有必要的 OAuth 參數都正確!')
        console.log('\n💡 如果在瀏覽器中還是看到錯誤,請:')
        console.log('   1. 清除瀏覽器快取 (Ctrl + Shift + Delete)')
        console.log('   2. 使用無痕模式測試')
        console.log('   3. 確認 Google Cloud Console 設定已生效 (等待 5 分鐘)')
        console.log('   4. 確認重新導向 URI 在 Console 中正確設定:')
        console.log(`      ${params.redirect_uri}`)
      } else {
        console.log('\n❌ 缺少必要的 OAuth 參數!')
        console.log('   請檢查 passport.js 和 routers/user.js 的配置')
      }

    } else {
      console.log(`\n❌ 預期狀態碼 302,但收到 ${response.status}`)
    }

  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log('測試完成!')
}

// 執行測試
testGoogleOAuth().catch(console.error)