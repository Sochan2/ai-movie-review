import { Movie, StreamingService, Genre, EmotionTag } from '@/types/movie';

export const availableStreamingServices: StreamingService[] = [
  { id: 'netflix', name: 'Netflix' },
  { id: 'amazon', name: 'Amazon Prime' },
  { id: 'disney', name: 'Disney+' },
  { id: 'hulu', name: 'Hulu' },
  { id: 'hbo', name: 'HBO Max' },
  { id: 'apple', name: 'Apple TV+' },
  { id: 'paramount', name: 'Paramount+' },
  { id: 'peacock', name: 'Peacock' }
  // ロゴは今は使わない。将来的に追加可。
];

export const genreOptions: Genre[] = [
  { id: 'action', name: 'Action' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'drama', name: 'Drama' },
  { id: 'horror', name: 'Horror' },
  { id: 'romance', name: 'Romance' },
  { id: 'sci-fi', name: 'Sci-Fi' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'documentary', name: 'Documentary' },
  { id: 'animation', name: 'Animation' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'crime', name: 'Crime' }
];

export const emotionTags: EmotionTag[] = [
  { id: 'excited', label: 'Exciting', color: 'red' },
  { id: 'happy', label: 'Uplifting', color: 'yellow' },
  { id: 'sad', label: 'Moving', color: 'blue' },
  { id: 'scared', label: 'Scary', color: 'purple' },
  { id: 'funny', label: 'Funny', color: 'green' },
  { id: 'bored', label: 'Boring', color: 'blue' },
  { id: 'confused', label: 'Confusing', color: 'pink' },
  { id: 'thoughtful', label: 'Thought-provoking', color: 'purple' },
  { id: 'tense', label: 'Suspenseful', color: 'red' },
  { id: 'nostalgic', label: 'Nostalgic', color: 'green' }
];

export const mockMovies: Movie[] = [
  {
    id: 'movie1',
    title: 'Inception',
    year: 2010,
    rating: 8.8,
    runtime: 148,
    poster: '/inception-poster.jpg',
    posterUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    backdropUrl: 'https://images.pexels.com/photos/3921045/pexels-photo-3921045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    director: 'Christopher Nolan',
    streamingServices: ['Netflix', 'Amazon Prime'],
    releaseDate: 'July 16, 2010',
    languages: ['English', 'Japanese', 'French'],
    justWatchUrl: 'https://www.justwatch.com/us/movie/inception',
    cast: [
      { name: 'Leonardo DiCaprio', character: 'Cobb', profileUrl: 'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Joseph Gordon-Levitt', character: 'Arthur', profileUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Ellen Page', character: 'Ariadne', profileUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
      { name: 'Tom Hardy', character: 'Eames', profileUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }
    ]
  },
  {
    id: 'movie2',
    title: 'The Shawshank Redemption',
    year: 1994,
    rating: 9.3,
    runtime: 142,
    posterUrl: 'https://images.pexels.com/photos/1486064/pexels-photo-1486064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    genres: ['Drama'],
    streamingServices: ['HBO Max', 'Netflix'],
    justWatchUrl: 'https://www.justwatch.com/us/movie/the-shawshank-redemption'
  },
  {
    id: 'movie3',
    title: 'The Dark Knight',
    year: 2008,
    rating: 9.0,
    runtime: 152,
    posterUrl: 'https://images.pexels.com/photos/1200450/pexels-photo-1200450.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genres: ['Action', 'Crime', 'Drama'],
    streamingServices: ['HBO Max', 'Amazon Prime'],
    justWatchUrl: 'https://www.justwatch.com/us/movie/the-dark-knight'
  },
  {
    id: 'movie4',
    title: 'Pulp Fiction',
    year: 1994,
    rating: 8.9,
    runtime: 154,
    posterUrl: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    genres: ['Crime', 'Drama'],
    streamingServices: ['Netflix', 'Amazon Prime'],
    justWatchUrl: 'https://www.justwatch.com/us/movie/pulp-fiction'
  },
  {
    id: 'movie5',
    title: 'Forrest Gump',
    year: 1994,
    rating: 8.8,
    runtime: 142,
    posterUrl: 'https://images.pexels.com/photos/1852083/pexels-photo-1852083.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.',
    genres: ['Drama', 'Romance'],
    streamingServices: ['Paramount+', 'Netflix'],
    justWatchUrl: 'https://www.justwatch.com/us/movie/forrest-gump'
  },
  {
    id: 'movie6',
    title: 'The Matrix',
    year: 1999,
    rating: 8.7,
    runtime: 136,
    posterUrl: 'https://images.pexels.com/photos/4644812/pexels-photo-4644812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    genres: ['Action', 'Sci-Fi'],
    streamingServices: ['HBO Max', 'Amazon Prime'],
    justWatchUrl: 'https://www.justwatch.com/us/movie/the-matrix'
  }
];