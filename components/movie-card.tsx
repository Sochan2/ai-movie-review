"use client";

import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Heart, ExternalLink, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie } from '@/types/movie';
import { useUser } from '@/context/user-context';
import { createClient } from '@/utils/supabase/client';

interface MovieCardProps {
  movie: Movie;
  isMasterpiece?: boolean;
  score?: number;
  requireLogin?: boolean;
  onRequireLogin?: () => void;
}

// Memoized MovieCard component to prevent unnecessary re-renders
export const MovieCard = memo(function MovieCard({ movie, isMasterpiece = false, score, requireLogin = false, onRequireLogin }: MovieCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isMasterpiece);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireLogin && onRequireLogin) {
      onRequireLogin();
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      if (!isFavorite) {
        // Add to masterpieces
        const { error } = await supabase.from('masterpieces').upsert({
          user_id: user.id,
          movie_id: movie.id,
        });
        if (error) throw error;
        setIsFavorite(true);
      } else {
        // Remove from masterpieces
        const { error } = await supabase.from('masterpieces').delete().eq('user_id', user.id).eq('movie_id', movie.id);
        if (error) throw error;
        setIsFavorite(false);
      }
    } catch (err) {
      console.error('Failed to update masterpiece:', err);
      alert('Failed to update masterpiece.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (requireLogin && onRequireLogin) {
      onRequireLogin();
      return;
    }
    router.push(`/movie/${movie.id}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // 必ずstringになるよう保証
  const posterUrl = imageError
    ? "https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    : (typeof movie.posterUrl === 'string' && movie.posterUrl.length > 0
        ? movie.posterUrl
        : "https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2");

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full cursor-pointer"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        {/* スコア表示 */}
        {typeof score === 'number' && (
          <div className="px-3 pt-3 text-xs text-primary font-bold">
            Your Score：{score}
          </div>
        )}
        <div className="relative pt-[150%]">
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className={cn(
              "object-cover transition-all duration-300 ease-in-out",
              isHovered ? "scale-105" : "scale-100"
            )}
            onError={handleImageError}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
            priority={false}
            loading="lazy"
          />
          
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 transition-opacity duration-300",
              isHovered && "opacity-100"
            )}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/20 backdrop-blur-sm text-white hover:bg-background/40 z-10"
            onClick={toggleFavorite}
            disabled={loading}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isFavorite && "fill-red-500 text-red-500"
              )}
            />
          </Button>
          
          {/* Only show streaming badges if we have the data */}
          {movie.streamingServices && movie.streamingServices.length > 0 && (
            <div className="absolute bottom-2 left-2 z-10">
              {/* ロゴは商用利用の都合で今は表示しません。将来的にimgタグでロゴを追加可能 */}
              {movie.streamingServices.slice(0, 2).map((service) => (
                <Badge key={service} variant="secondary" className="mr-1 mb-1 text-xs">
                  {service}
                </Badge>
              ))}
              {movie.streamingServices.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{movie.streamingServices.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <CardHeader className="py-3">
          <CardTitle className="text-base line-clamp-1">{movie.title}</CardTitle>
          <CardDescription className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1 inline" />
            {movie.rating} | {movie.year}
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="mt-auto pt-0">
          <div className="w-full flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {movie.genres?.slice(0, 2).join(', ')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-0"
              onClick={(e) => e.stopPropagation()}
              asChild
            >
              <a
                href={movie.justWatchUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});