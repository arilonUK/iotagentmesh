
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getBlogPost } from '@/services/blogService';

const BlogPost = () => {
  const { id } = useParams();
  const post = getBlogPost(Number(id));
  
  if (!post) {
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
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Post not found</h1>
              <p className="text-muted-foreground">The blog post you're looking for doesn't exist.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <Link to="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          
          <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </div>
                <Badge 
                  variant="secondary"
                  className="hover:bg-secondary/80"
                >
                  {post.category}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 !mt-0">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Written by</span>
                <span className="font-medium text-foreground">{post.author}</span>
              </div>
            </div>
            
            <div className="[&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-10 [&>h2]:mb-4
                          [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-4
                          [&>p]:leading-7 [&>p]:mb-6
                          [&>ul]:my-6 [&>ul]:list-disc [&>ul]:pl-6
                          [&>ol]:my-6 [&>ol]:list-decimal [&>ol]:pl-6
                          [&>li]:mb-2">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </article>
          
          <div className="mt-16 pt-8 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Share this article
              </div>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">Twitter</Button>
                <Button variant="outline" size="sm">LinkedIn</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;
