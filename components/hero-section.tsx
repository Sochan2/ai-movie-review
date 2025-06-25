"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  
  // Mock backdrop images - in a real app, these would be from TMDb
  const backdropImages = [
    "https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/3921045/pexels-photo-3921045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % backdropImages.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [mounted, backdropImages.length]);

  if (!mounted) {
    return null; // Prevent flash of incorrect content
  }

  return (
    <div className="relative h-screen flex items-center overflow-hidden">
      {/* Background image */}
      {backdropImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === backgroundIndex ? 'opacity-60' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Your Next <span className="text-primary">Masterpiece</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Personal movie recommendations tailored to your streaming services and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/recommendations">
                Get Recommendations
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/onboarding">Set Up Your Profile</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}