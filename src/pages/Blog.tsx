
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  getBlogPosts, 
  getBlogCategories, 
  searchBlogPosts, 
  getBlogPostsByCategory 
} from '@/services/blogService';
import type { BlogPost } from '@/services/blogService';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getBlogCategories();

  const getFilteredPosts = (): BlogPost[] => {
    let posts = getBlogPosts();
    
    if (selectedCategory) {
      posts = getBlogPostsByCategory(selectedCategory);
    }
    
    if (searchQuery) {
      posts = searchBlogPosts(searchQuery);
    }
    
    return posts;
  };

  const filteredPosts = getFilteredPosts();

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

          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(
                      selectedCategory === category ? null : category
                    )}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
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
