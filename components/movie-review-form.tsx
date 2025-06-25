"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { StarRating } from '@/components/star-rating';
import { EmotionTagSelector } from '@/components/emotion-tag-selector';
import { emotionTags } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const reviewSchema = z.object({
  text: z.string().min(1, "Please enter your review").max(500, "Review is too long"),
  rating: z.number().min(1, "Please provide a rating").max(5),
  emotions: z.array(z.string()).min(1, "Please select at least one emotion"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface MovieReviewFormProps {
  movieId: string;
}

export function MovieReviewForm({ movieId }: MovieReviewFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      text: "",
      rating: 0,
      emotions: [],
    },
  });
  
  const onSubmit = (data: ReviewFormValues) => {
    // In a real app, submit review to API
    console.log("Review submitted:", data, "for movie:", movieId);
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback! We'll use it to improve your recommendations.",
    });
    
    // Reset form
    form.reset();
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <StarRating
                  rating={field.value}
                  onChange={field.onChange}
                  max={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts about this movie..."
                  className="resize-none h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="emotions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did this movie make you feel?</FormLabel>
              <FormControl>
                <EmotionTagSelector
                  selectedEmotions={field.value}
                  onChange={field.onChange}
                  emotions={emotionTags}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full md:w-auto">
          Submit Review
        </Button>
      </form>
    </Form>
  );
}