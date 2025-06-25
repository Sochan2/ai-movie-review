/*
  # Create movie recommendation system tables

  1. New Tables
    - `movies`
      - `id` (text, primary key) - TMDb movie ID
      - `title` (text)
      - `genres` (text array)
      - `overview` (text)
      - `poster_url` (text)
      - `providers` (text array)
      - `popularity` (float)
      - `view_availability_score` (int)
      - `created_at` (timestamp)

    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `movie_id` (text, references movies)
      - `rating` (int)
      - `review_text` (text)
      - `tags` (text array)
      - `created_at` (timestamp)

    - `masterpieces`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `movie_id` (text, references movies)
      - `reason` (text)
      - `created_at` (timestamp)

    - `unavailable_votes`
      - `id` (uuid, primary key)
      - `movie_id` (text, references movies)
      - `user_id` (uuid, references users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id text PRIMARY KEY,
  title text NOT NULL,
  genres text[] DEFAULT '{}',
  overview text,
  poster_url text,
  providers text[] DEFAULT '{}',
  popularity float DEFAULT 0,
  view_availability_score int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movies are viewable by everyone"
  ON movies FOR SELECT
  TO authenticated
  USING (true);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  movie_id text REFERENCES movies(id) ON DELETE CASCADE,
  rating int CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Masterpieces table
CREATE TABLE IF NOT EXISTS masterpieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  movie_id text REFERENCES movies(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE masterpieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their masterpieces"
  ON masterpieces
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Unavailable votes table
CREATE TABLE IF NOT EXISTS unavailable_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id text REFERENCES movies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE unavailable_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their unavailable votes"
  ON unavailable_votes
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_masterpieces_user_id ON masterpieces(user_id);
CREATE INDEX IF NOT EXISTS idx_masterpieces_movie_id ON masterpieces(movie_id);
CREATE INDEX IF NOT EXISTS idx_unavailable_votes_movie_id ON unavailable_votes(movie_id);