// src/pages/ResultsPage.jsx
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useJobPoller } from '../hooks/useJobPoller'; // (This hook is unchanged)

// --- shadcn/ui & icon imports ---
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle, Eye, Calendar } from 'lucide-react';

// --- (Your useJobPoller hook is UNCHANGED) ---
// ... (paste the useJobPoller hook code here) ...

// --- Helper for formatting numbers ---
const formatNum = (num) => (num || 0).toLocaleString() || '0';

export default function ResultsPage() {
  const { result_id } = useParams();
  const { job, error } = useJobPoller(result_id);
  
  // --- UPDATED: Default sort by 'view_count' ---
  const [sortBy, setSortBy] = useState('view_count');

  // --- UPDATED: Sorting logic for new keys ---
  const sortedResults = useMemo(() => {
    if (!job || job.status !== 'complete') return [];
    
    // job.results is now your new JSON array
    const results = [...job.results]; 

    if (sortBy === 'view_count') {
      // Sort by view_count, descending
      return results.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }
    if (sortBy === 'post_date') {
      // Sort by post_date, descending (newest first)
      return results.sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
    }
    return results;
  }, [job, sortBy]);

  // --- (Loading and Error render logic is unchanged) ---
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
              <Skeleton className="h-64 w-full" />
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardFooter><Skeleton className="h-5 w-1/2" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- Job is Complete! (UPDATED RENDER LOGIC) ---
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Report for {job.profile_url}</h2>
          <p className="text-lg text-muted-foreground">Found {sortedResults.length} posts.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium shrink-0">Sort by:</label>
          
          {/* --- UPDATED: Select options --- */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view_count">Top Views</SelectItem>
              <SelectItem value="post_date">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- UPDATED: Results Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedResults.map((post) => (
          <Card key={post.post_url} className="flex flex-col justify-between overflow-hidden">
            
            {/* Clickable Thumbnail Image */}
            <a href={post.post_url} target="_blank" rel="noopener noreferrer">
              <img 
                src={post.thumbnail_url} 
                alt={post.media_type === 'video' ? 'Video Post' : 'Image Post'} 
                className="aspect-square object-cover w-full hover:scale-105 transition-transform" 
              />
            </a>
            
            <CardHeader>
              <CardTitle className="text-lg">
                {post.media_type === 'video' ? 'Reel/Video Post' : 'Image Post'}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 pt-1">
                 <Calendar className="h-3.5 w-3.5" /> 
                 {new Date(post.post_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            
            {/* Removed CardContent (caption) */}

            <CardFooter className="flex justify-start text-sm font-medium pt-4 border-t">
              <span className="flex items-center gap-1" title="Views">
                <Eye className="h-4 w-4" /> 
                {/* Show view_count for videos, N/A for images */}
                {post.media_type === 'video' ? formatNum(post.view_count) : 'N/A'}
              </span>
              {/* Removed Likes and Comments */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
