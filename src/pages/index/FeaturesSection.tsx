
import React from "react";
import { Network, Cloud, Shield, BarChart3, Cpu, Zap, Globe, Lock, Workflow, Database, Terminal } from "lucide-react";

const features = [
  {
    icon: Network,
    title: "Device Management",
    description: "Connect and manage millions of IoT devices with automatic discovery, provisioning, and lifecycle management.",
    color: "text-blue-500"
  },
  {
    icon: Cloud,
    title: "Cloud Integration",
    description: "Seamlessly integrate with AWS, Azure, and GCP. Deploy agents anywhere with multi-cloud support.",
    color: "text-purple-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, zero-trust architecture, and compliance with SOC 2, ISO 27001, and GDPR standards.",
    color: "text-green-500"
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Process and analyze billions of data points in real-time with built-in machine learning capabilities.",
    color: "text-orange-500"
  },
  {
    icon: Cpu,
    title: "Edge Computing",
    description: "Run intelligent agents at the edge for ultra-low latency processing and offline capabilities.",
    color: "text-red-500"
  },
  {
    icon: Zap,
    title: "High Performance",
    description: "Handle millions of concurrent connections with sub-millisecond latency and 99.99% uptime.",
    color: "text-yellow-500"
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Deploy across 150+ countries with edge locations worldwide for optimal performance.",
    color: "text-cyan-500"
  },
  {
    icon: Workflow,
    title: "Agent Coordination",
    description: "Multi-agent control platform for orchestrating complex IoT workflows and automations.",
    color: "text-indigo-500"
  },
  {
    icon: Database,
    title: "Time-series Storage",
    description: "Purpose-built database for IoT telemetry with automatic compression and long-term retention.",
    color: "text-pink-500"
  },
  {
    icon: Terminal,
    title: "Developer APIs",
    description: "RESTful APIs, WebSocket support, and SDKs for all major programming languages.",
    color: "text-teal-500"
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Fine-grained permissions and role-based access control for teams and organizations.",
    color: "text-violet-500"
  },
  {
    icon: BarChart3,
    title: "Custom Dashboards",
    description: "Build beautiful, real-time dashboards with our flexible visualization components.",
    color: "text-amber-500"
  }
];

const FeaturesSection = () => (
  <section className="py-20 md:py-32 bg-muted/30">
    <div className="container mx-auto max-w-7xl px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything you need to build IoT solutions
        </h2>
        <p className="text-lg text-muted-foreground">
          A complete platform with powerful features designed for developers, enterprises, and IoT innovators.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group relative rounded-xl border bg-card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 ${feature.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
