/*
  # Create users table and authentication schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, matches Supabase auth.users.id)
      - `display_name` (text, nullable)
      - `is_anonymous` (boolean)
      - `selected_subscriptions` (text array)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users to:
      - Read their own data
      - Insert their own data
      - Update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  is_anonymous boolean DEFAULT false,
  selected_subscriptions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy to allow users to insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);