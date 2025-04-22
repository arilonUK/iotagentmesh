
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
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
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">{post.date}</span>
              <Badge variant="outline">{post.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="text-sm mb-8">By {post.author}</div>
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;
