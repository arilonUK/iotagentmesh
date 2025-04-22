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
  },
  {
    id: 3,
    title: "It depends!",
    content: `
# It depends!

The answer in IoT data analysis is always "it depends!" Let's explore why context is crucial for making sense of sensor data.

## The Context Challenge

When analyzing IoT sensor data, a reading of 75°F might seem normal. But is it? It depends on:

- **Location Context**: Is this temperature reading from a server room or an office space?
- **Time Context**: Is this during peak operations or during off-hours?
- **Historical Context**: How does this compare to typical patterns?
- **External Factors**: What's the outside temperature? Are there other environmental influences?

## The Power of Contextual Analysis

IoTAgentMesh was designed with this fundamental truth in mind: data without context is just numbers. Our platform brings together:

1. **Internal Context**
   - Historical data patterns
   - Related sensor readings
   - System states and configurations

2. **External Context**
   - Environmental conditions
   - Time-based patterns
   - Related systems' status

3. **Operational Context**
   - Business rules and thresholds
   - Maintenance schedules
   - User behavior patterns

## From Data to Wisdom

The IoTAgentMesh concept transforms raw sensor data into actionable insights by:

- Correlating multiple data sources
- Applying contextual rules
- Learning from historical patterns
- Adapting to changing conditions

Remember: The next time someone asks "What does this sensor reading mean?", start your answer with "It depends!" and then leverage IoTAgentMesh to provide the full context for truly intelligent decision-making.
    `,
    excerpt: "The answer is always it depends! Discover why context is crucial for IoT data analysis and decision-making.",
    date: "2025-04-22",
    author: "IoT Team",
    category: "Insights",
    slug: "it-depends"
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
