
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const samplePosts = [
    {
      id: 1,
      title: "Getting Started with IoTAgentMesh",
      excerpt: "Learn how to set up and configure your first IoT device with IoTAgentMesh platform.",
      date: "2025-04-20",
      author: "IoT Team",
      category: "Tutorials"
    },
    {
      id: 2,
      title: "Best Practices for IoT Device Management",
      excerpt: "Discover the essential practices for managing your IoT devices at scale.",
      date: "2025-04-18",
      author: "IoT Team",
      category: "Best Practices"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground">
              Latest insights, tutorials, and updates from the IoTAgentMesh team
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {samplePosts.map((post) => (
              <article key={post.id} className="group">
                <Link to={`/blog/${post.id}`} className="block">
                  <div className="iot-card p-6 h-full hover:border-primary transition-colors">
                    <div className="text-sm text-muted-foreground mb-2">
                      {post.date} · {post.category}
                    </div>
                    <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 text-sm">
                      By {post.author}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blog;
