
import React from 'react';
import StoryMap from '@/components/documentation/StoryMap';

export default function ProductRoadmap() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Product Roadmap</h1>
        <p className="text-muted-foreground mt-2">
          Track our product development journey and upcoming features.
        </p>
      </div>
      <StoryMap />
    </div>
  );
}
