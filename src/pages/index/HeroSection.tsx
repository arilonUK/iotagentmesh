
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => (
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
);

export default HeroSection;
