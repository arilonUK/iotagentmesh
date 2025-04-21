
import React from "react";
import { Laptop, Cloud, Shield, BarChart2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FeaturesSection = () => (
  <section className="iot-section">
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Complete IoT Management Platform</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive solution for your IoT ecosystem, from device management to data visualization.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="iot-card p-6">
          <div className="size-12 rounded-lg bg-iot-purple/10 flex items-center justify-center mb-4">
            <Laptop className="text-iot-purple" />
          </div>
          <h3 className="text-xl font-medium mb-2">Device Management</h3>
          <p className="text-muted-foreground">
            Connect and manage all your IoT devices from a single dashboard with real-time monitoring.
          </p>
        </div>
        <div className="iot-card p-6">
          <div className="size-12 rounded-lg bg-iot-purple/10 flex items-center justify-center mb-4">
            <Cloud className="text-iot-purple" />
          </div>
          <h3 className="text-xl font-medium mb-2">Cloud Integration</h3>
          <p className="text-muted-foreground">
            Store and process your data securely in the cloud with our scalable infrastructure.
          </p>
        </div>
        <div className="iot-card p-6">
          <div className="size-12 rounded-lg bg-iot-purple/10 flex items-center justify-center mb-4">
            <Shield className="text-iot-purple" />
          </div>
          <h3 className="text-xl font-medium mb-2">Security & Compliance</h3>
          <p className="text-muted-foreground">
            Enterprise-grade security with end-to-end encryption and compliance features.
          </p>
        </div>
        <div className="iot-card p-6">
          <div className="size-12 rounded-lg bg-iot-purple/10 flex items-center justify-center mb-4">
            <BarChart2 className="text-iot-purple" />
          </div>
          <h3 className="text-xl font-medium mb-2">Data Analytics</h3>
          <p className="text-muted-foreground">
            Turn your IoT data into insights with powerful analytics and visualization tools.
          </p>
        </div>
        <div className="iot-card p-6">
          <div className="size-12 rounded-lg bg-iot-purple/10 flex items-center justify-center mb-4">
            <Zap className="text-iot-purple" />
          </div>
          <h3 className="text-xl font-medium mb-2">Edge Computing</h3>
          <p className="text-muted-foreground">
            Process data at the edge for lower latency and reduced bandwidth requirements.
          </p>
        </div>
        <div className="iot-card p-6 flex items-center justify-center">
          <Link to="/features">
            <Button variant="outline">
              View all features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
