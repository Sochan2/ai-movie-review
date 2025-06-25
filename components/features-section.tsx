"use client";

import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { motion } from 'framer-motion';

export function FeaturesSection() {
  const features = [
    {
      emoji: '💎',
      title: 'Save Your Masterpieces',
      description: 'Keep a collection of movies that truly moved you.'
    },
    {
      emoji: '🤖',
      title: 'AI Movie Suggestions',
      description: 'Get 5 recommendations based on your reviews and emotional analysis.'
    },
    {
      emoji: '📺',
      title: 'Streaming Integration',
      description: 'Only see movies available on your subscribed streaming services.'
    },
    {
      emoji: '📈',
      title: 'Emotional Insights',
      description: 'Visualize your emotional patterns to better understand your preferences.'
    }
  ];

  const steps = [
    {
      emoji: '🎬',
      title: 'Watch a Movie',
      description: 'Enjoy any movie from your favorite streaming service.'
    },
    {
      emoji: '✍️',
      title: 'Write a Review',
      description: 'Share your thoughts and impressions.'
    },
    {
      emoji: '🤖',
      title: 'AI Analyzes Your Review',
      description: 'Our AI reads your review and extracts emotional and thematic tags.'
    },
    {
      emoji: '🎯',
      title: 'Get Movie Recommendations',
      description: 'Get 5 similar movies you\'ll probably love, tailored to your preferences.'
    }
  ];

  return (
    <section className="w-full bg-black text-white py-20">
      <div className="container mx-auto px-4">
        {/* Main Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">What You Can Do with MyMasterpiece</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Discover how AI and personalization make your movie experience better.</p>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 text-white h-full transition-transform duration-200">
                <CardHeader className="flex flex-col items-center justify-center text-center gap-2 p-8">
                  <span className="text-4xl mb-2">{feature.emoji}</span>
                  <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-base mt-1">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
        {/* Step-by-step Section */}
        <div className="mb-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold mb-2">How It Works</h3>
            <p className="text-gray-400 max-w-xl mx-auto">A step-by-step guide to using MyMasterpiece as your movie review and recommendation platform.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-8 w-full">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex-1 w-full max-w-xs"
              >
                <div className="flex flex-col items-center text-center bg-zinc-900 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-200 group">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-zinc-800 mb-4 text-3xl group-hover:scale-110 transition-transform">{step.emoji}</div>
                  <div className="font-bold text-lg mb-1">{step.title}</div>
                  <div className="text-gray-400 text-base">{step.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}