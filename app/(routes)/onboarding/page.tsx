"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { availableStreamingServices, genreOptions } from '@/lib/mock-data';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/user-context';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { user } = useUser();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  
  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const nextStep = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setError(null);
      if (user) {
        try {
          // サブスク・ジャンルをuser_profilesに保存
          const { error: upsertError } = await supabase
            .from('user_profiles')
            .upsert({ user_id: user.id, selected_subscriptions: selectedServices, favorite_genres: selectedGenres });
          if (upsertError) throw upsertError;
          router.push('/recommendations');
        } catch (e: any) {
          setError('Fali to store. Please recheck your connection ');
        }
      } else {
        setError('Cannot get user information. Please login again');
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-16 px-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Set Up Your Preferences</CardTitle>
          <CardDescription>
            Help us recommend the perfect movies for you
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="py-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Select your streaming services
                </h3>
                <p className="text-muted-foreground mb-6">
                  We&apos;ll only recommend movies available on these platforms
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableStreamingServices.map((service) => (
                    <div key={service.id} className="flex items-start space-x-3">
                      <Checkbox 
                        id={`service-${service.id}`} 
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <Label 
                        htmlFor={`service-${service.id}`}
                        className="font-normal"
                      >
                        {service.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  What genres do you enjoy?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Select all that apply
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {genreOptions.map((genre) => (
                    <div key={genre.id} className="flex items-start space-x-3">
                      <Checkbox 
                        id={`genre-${genre.id}`} 
                        checked={selectedGenres.includes(genre.id)}
                        onCheckedChange={() => handleGenreToggle(genre.id)}
                      />
                      <Label 
                        htmlFor={`genre-${genre.id}`}
                        className="font-normal"
                      >
                        {genre.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between flex-col gap-2 md:flex-row md:gap-0">
          <div className="flex w-full justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button onClick={nextStep}>
              {step < totalSteps ? "Next" : "Finish"}
            </Button>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2 text-center w-full">{error}</div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}