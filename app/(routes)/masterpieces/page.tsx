"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { createClient } from "@/utils/supabase/client";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";

export default function MasterpiecesPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [masterpieces, setMasterpieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    const fetchMasterpieces = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("masterpieces")
        .select("*, movie:movies(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching masterpieces:", error);
        setMasterpieces([]);
      } else {
        setMasterpieces(data || []);
      }
      setLoading(false);
    };
    fetchMasterpieces();
  }, [user, isLoading, supabase]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Masterpieces</h1>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
      {masterpieces.length === 0 ? (
        <div className="text-center text-muted-foreground py-24">
          <p className="text-lg mb-4">You have not registered any masterpieces yet.</p>
          <Button onClick={() => router.push("/")}>Discover Movies</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {masterpieces.map((m) => {
            if (!m.movie) return null;
            // Ensure posterUrl is present for MovieCard
            const movieWithPosterUrl = {
              ...m.movie,
              posterUrl: m.movie.posterUrl || m.movie.poster_url || '',
            };
            return (
              <MovieCard key={m.movie.id} movie={movieWithPosterUrl} isMasterpiece={true} />
            );
          })}
        </div>
      )}
    </div>
  );
} 
