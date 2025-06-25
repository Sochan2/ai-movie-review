// Script to seed the database with sample movie data
// Run this script after setting up your Supabase project

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleMovies = [
  {
    id: '1',
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    poster_url: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    popularity: 9.3,
    genres: ['Drama'],
    providers: ['Netflix', 'Amazon Prime'],
    release_date: '1994-09-22',
    runtime: 142,
    director: 'Frank Darabont'
  },
  {
    id: '2',
    title: 'The Godfather',
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    poster_url: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    popularity: 9.2,
    genres: ['Crime', 'Drama'],
    providers: ['HBO Max', 'Amazon Prime'],
    release_date: '1972-03-24',
    runtime: 175,
    director: 'Francis Ford Coppola'
  },
  {
    id: '3',
    title: 'Pulp Fiction',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    poster_url: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    popularity: 8.9,
    genres: ['Crime', 'Drama'],
    providers: ['Netflix', 'Hulu'],
    release_date: '1994-10-14',
    runtime: 154,
    director: 'Quentin Tarantino'
  }
];

async function seedMovies() {
  try {
    console.log('Seeding movies...');
    
    for (const movie of sampleMovies) {
      const { error } = await supabase
        .from('movies')
        .upsert(movie, { onConflict: 'id' });
      
      if (error) {
        console.error('Error inserting movie:', movie.title, error);
      } else {
        console.log('Successfully inserted:', movie.title);
      }
    }
    
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error seeding movies:', error);
  }
}

// Run the seeding function
seedMovies(); 