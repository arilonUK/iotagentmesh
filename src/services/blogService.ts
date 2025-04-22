
export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  slug: string;
}

// This is a mock data service. In a real app, this would fetch from an API
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Getting Started with IoTAgentMesh",
    content: `
# Getting Started with IoTAgentMesh

IoTAgentMesh is a powerful platform for managing IoT devices at scale. In this guide, we'll walk through the basics of setting up your first device.

## Prerequisites
- An IoTAgentMesh account
- A compatible IoT device
- Basic understanding of IoT protocols

## Setup Steps
1. Create your organization
2. Add your first device
3. Configure device settings
4. Monitor device health

Stay tuned for more detailed guides on advanced features!
    `,
    excerpt: "Learn how to set up and configure your first IoT device with IoTAgentMesh platform.",
    date: "2025-04-20",
    author: "IoT Team",
    category: "Tutorials",
    slug: "getting-started-with-iotagentmesh"
  },
  {
    id: 2,
    title: "Best Practices for IoT Device Management",
    content: `
# Best Practices for IoT Device Management

Managing IoT devices at scale requires careful planning and good practices. Here are our recommended approaches.

## Key Areas
- Device Security
- Network Management
- Data Collection
- Monitoring

## Security Best Practices
1. Use strong authentication
2. Implement encryption
3. Regular security audits
4. Keep firmware updated

More detailed guides coming soon!
    `,
    excerpt: "Discover the essential practices for managing your IoT devices at scale.",
    date: "2025-04-18",
    author: "IoT Team",
    category: "Best Practices",
    slug: "best-practices-for-iot-device-management"
  }
];

export const getBlogPosts = () => blogPosts;

export const getBlogPost = (id: number) => {
  return blogPosts.find(post => post.id === id);
};

export const searchBlogPosts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.content.toLowerCase().includes(lowercaseQuery) ||
    post.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getBlogCategories = () => {
  const categories = new Set(blogPosts.map(post => post.category));
  return Array.from(categories);
};

export const getBlogPostsByCategory = (category: string) => {
  return blogPosts.filter(post => post.category === category);
};

