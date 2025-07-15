// package.json should include: { "type": "module" }
import 'dotenv/config';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.env.USER_ID;

async function deleteUser() {
  // 1. 関連テーブルのデータを先に削除
  const tables = [
    { name: 'user_profiles', key: 'user_id' },
    { name: 'reviews', key: 'user_id' },
    { name: 'masterpieces', key: 'user_id' },
    { name: 'users', key: 'id' }, // usersテーブルだけidで削除
  ];

  for (const { name, key } of tables) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${name}?${key}=eq.${USER_ID}`, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    });
    if (!res.ok) {
      const error = await res.text();
      console.error(`Failed to delete from ${name}:`, error, res.status, res.statusText);
    } else {
      console.log(`Deleted related data from ${name}`);
    }
  }

  // 2. Authユーザーを削除
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (res.ok) {
    console.log('User deleted successfully');
  } else {
    const error = await res.text();
    console.error('Failed to delete user:', error, res.status, res.statusText);
  }
}

// ここに削除したいユーザーのU26fc265f-1630-4962-a7a7-dd999b1c674eUIDを入れる
await deleteUser(); 