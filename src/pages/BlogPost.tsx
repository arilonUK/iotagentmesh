
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams();
  
  // This is a placeholder. In the next step, we'll implement proper data fetching
  const post = {
    title: "Getting Started with IoTAgentMesh",
    content: "This is a placeholder for the full blog post content. In the next implementation phase, we'll add proper content management and markdown rendering.",
    date: "2025-04-20",
    author: "IoT Team",
    category: "Tutorials"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <Link to="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          
          <article>
            <div className="text-sm text-muted-foreground mb-4">
              {post.date} · {post.category}
            </div>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="text-sm mb-8">By {post.author}</div>
            <div className="prose max-w-none">
              {post.content}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;
