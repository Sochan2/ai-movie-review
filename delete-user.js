import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,         // 例: https://abcd1234.supabase.co
  process.env.SUPABASE_SERVICE_ROLE_KEY         // Service Role Key
)

async function deleteUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) {
    console.error('削除失敗:', error.message)
  } else {
    console.log('削除成功！')
  }
}

// ここに削除したいユーザーのUUIDを入れる
deleteUser('86a4826f-ab25-4273-875d-1f9ba6ef48dc') 