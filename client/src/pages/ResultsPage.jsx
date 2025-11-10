// src/pages/ResultsPage.jsx
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useJobPoller } from '../hooks/useJobPoller'; // Import our hook

// --- shadcn/ui & icon imports ---
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle, Eye, Heart, MessageCircle, Calendar } from 'lucide-react';

// --- Helper for formatting numbers ---
const formatNum = (num) => (num || 0).toLocaleString() || '0';

export default function ResultsPage() {
  const { result_id } = useParams();
  // Our custom hook does all the hard work!
  const { job, error } = useJobPoller(result_id);
  const [sortBy, setSortBy] = useState('views');

  const sortedResults = useMemo(() => {
    if (!job || job.status !== 'complete') return [];
    const results = [...job.results];
    if (sortBy === 'views') return results.sort((a, b) => (b.video_views || 0) - (a.video_views || 0));
    if (sortBy === 'likes') return results.sort((a, b) => b.likes - a.likes);
    if (sortBy === 'comments') return results.sort((a, b) => b.comments - a.comments);
    if (sortBy === 'date') return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return results;
  }, [job, sortBy]);

  // --- Render Logic ---

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!job || job.status === 'pending' || job.status === 'scraping') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-semibold">Analyzing {job?.profile_url}...</h2>
        <p className="text-muted-foreground">Your report is being generated. This page will update.</p>
        <p className="font-medium capitalize">Status: {job?.status || 'Loading...'}</p>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-full" /></CardContent>
              <CardFooter><Skeleton className="h-5 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- Job is Complete! ---
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Report for {job.profile_url}</h2>
          <p className="text-lg text-muted-foreground">Found {sortedResults.length} posts.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium shrink-0">Sort by:</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Top Views (Reels)</SelectItem>
              <SelectItem value="likes">Top Likes</SelectItem>
              <SelectItem value="comments">Top Comments</SelectItem>
              <SelectItem value="date">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResults.map((post) => (
          <Card key={post.shortcode} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg">
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {post.is_video ? 'Reel/Video Post' : 'Image Post'}
                </a>
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 pt-1">
                 <Calendar className="h-3.5 w-3.5" /> 
                 {new Date(post.timestamp).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.caption}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between text-sm font-medium pt-4 border-t">
              <span className="flex items-center gap-1" title="Views">
                <Eye className="h-4 w-4" /> {post.is_video ? formatNum(post.video_views) : 'N/A'}
              </span>
              <span className="flex items-center gap-1" title="Likes">
                <Heart className="h-4 w-4" /> {formatNum(post.likes)}
              </span>
              <span className="flex items-center gap-1" title="Comments">
                <MessageCircle className="h-4 w-4" /> {formatNum(post.comments)}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}