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

// ここに削除したいユーザーのU26fc265f-1630-4962-a7a7-dd999b1c674eUIDを入れる
deleteUser('6717ed89-7bb3-431b-b5c2-fa085539a255') 