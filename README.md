# My Masterpiece - Movie Review App

A Next.js application for discovering, reviewing, and tracking your favorite movies.

## Features

- **Movie Discovery**: Browse popular movies from TMDB
- **Movie Details**: View detailed information about movies including streaming availability
- **JustWatch Integration**: See where movies are available to stream with provider logos
- **Review System**: Rate and review movies with emotion tags
- **User Authentication**: Secure login with Supabase
- **Personal Collections**: Save movies to your masterpiece collection

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Site URL for email redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Get TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account
3. Go to Settings > API
4. Request an API key for developer use
5. Copy the API key to your `.env.local` file

### 3. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Add them to your `.env.local` file
4. Create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  selected_subscriptions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Movies Table
```sql
CREATE TABLE movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  overview TEXT,
  poster_url TEXT,
  popularity DECIMAL,
  genres TEXT[],
  providers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id TEXT REFERENCES movies(id),
  user_id UUID REFERENCES users(id),
  review_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  emotions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## JustWatch Integration

The app integrates with JustWatch to show streaming availability:

- **Provider Names**: Display streaming service names (Netflix, Amazon Prime, etc.) as text only.
- **Availability Types**: Categorize by subscription, free, ad-supported, rent, or buy
- **Direct Links**: Click on providers to go to JustWatch for detailed information
- **Error Reporting**: Report incorrect information directly to JustWatch

## API Endpoints

- `/api/movies` - Get popular movies
- `/api/movies/search` - Search movies
- `/api/movies/[id]` - Get movie details with streaming info

## Technologies Used

- **Next.js 13** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **TMDB API** - Movie data
- **JustWatch** - Streaming availability
- **Lucide React** - Icons
- **Radix UI** - UI components 