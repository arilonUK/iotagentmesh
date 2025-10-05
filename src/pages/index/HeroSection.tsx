
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Globe, TrendingUp } from "lucide-react";

const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background py-20 md:py-32">
    {/* Background decoration */}
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
    
    <div className="container relative mx-auto max-w-7xl px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="h-4 w-4" />
            Next-generation IoT platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Manage Your IoT Infrastructure at{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Scale
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            IoTAgentMesh provides a unified platform to connect, monitor, and control millions of IoT devices. 
            Build secure, scalable solutions with real-time data processing and intelligent agent coordination.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto group">
                Start building for free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View documentation
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t">
            <div>
              <div className="text-2xl md:text-3xl font-bold">10M+</div>
              <div className="text-sm text-muted-foreground">Devices Connected</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold">150+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
        
        {/* Visual */}
        <div className="relative">
          <div className="relative rounded-2xl border bg-card p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Device status cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-background p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Temperature</span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">24.5°C</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>Normal</span>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-background p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Devices</span>
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">2,847</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span>All secure</span>
                  </div>
                </div>
              </div>
              
              {/* Activity chart placeholder */}
              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-medium mb-4">Real-time Activity</div>
                <div className="h-32 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/40"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-muted-foreground">System operational</span>
                </div>
                <span className="text-muted-foreground">Last updated: 2s ago</span>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

