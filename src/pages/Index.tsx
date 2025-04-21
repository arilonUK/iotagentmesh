
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Laptop, Cloud, Shield, BarChart2, Zap } from "lucide-react";
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="iot-section bg-gradient-to-b from-iot-gray-light to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium bg-white text-iot-purple">
                <span className="flex h-1.5 w-1.5 rounded-full bg-iot-purple mr-1.5"></span>
                Launching IoTAgentMesh
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                The future of IoT management is here
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect, monitor, and control your IoT devices with our powerful cloud platform.
                Built for developers, designed for scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Read documentation
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-br from-iot-purple-light to-iot-purple-dark p-1">
                <div className="rounded-lg bg-white/5 backdrop-blur p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Temperature</span>
                        <span className="text-sm opacity-75">Living Room</span>
                      </div>
                      <div className="text-2xl font-bold text-white">23.5°C</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Humidity</span>
                        <span className="text-sm opacity-75">Living Room</span>
                      </div>
                      <div className="text-2xl font-bold text-white">45%</div>
                    </div>
                    <div className="col-span-2 bg-white/10 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">Energy Usage</span>
                        <span className="text-sm opacity-75">Today</span>
                      </div>
                      <div className="text-2xl font-bold text-white">4.2 kWh</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 size-24 bg-iot-purple/10 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -left-4 -z-10 size-24 bg-iot-purple/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* CTA Section */}
      <section className="iot-section bg-iot-gray-light">
        <div className="container mx-auto max-w-6xl">
          <div className="iot-card p-10 md:p-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your IoT infrastructure?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of companies already using IoTAgentMesh to power their connected devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">Start for free</Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">Contact sales</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg iot-gradient-bg flex items-center justify-center">
                  <span className="font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-semibold">IoTAgentMesh</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The future of IoT management platform
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-foreground">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link to="/support" className="hover:text-foreground">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/legal" className="hover:text-foreground">Legal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-6 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2025 IoTAgentMesh. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
