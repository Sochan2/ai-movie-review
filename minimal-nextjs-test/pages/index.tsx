import { createClient } from '@supabase/supabase-js';
export default function Home() {
  createClient('https://test.supabase.co', 'public-anon-key');
  return <div>hello</div>;
}
