import React from "react";
import { Plug, Settings, LineChart, Rocket } from "lucide-react";

const steps = [
  {
    icon: Plug,
    title: "Connect Your Devices",
    description: "Use our SDKs or REST APIs to connect devices in minutes. Supports MQTT, HTTP, and WebSocket protocols.",
    step: "01"
  },
  {
    icon: Settings,
    title: "Configure & Monitor",
    description: "Set up real-time monitoring, alerts, and automations through our intuitive dashboard.",
    step: "02"
  },
  {
    icon: LineChart,
    title: "Analyze Data",
    description: "Gain insights with built-in analytics, custom queries, and machine learning models.",
    step: "03"
  },
  {
    icon: Rocket,
    title: "Scale & Optimize",
    description: "Grow from prototype to production seamlessly. Our infrastructure scales automatically.",
    step: "04"
  }
];

const HowItWorksSection = () => (
  <section className="py-20 md:py-32">
    <div className="container mx-auto max-w-7xl px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Get started in minutes
        </h2>
        <p className="text-lg text-muted-foreground">
          From prototype to production in four simple steps. No complex setup required.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2" />
              )}
              
              <div className="relative text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {step.step}
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mx-auto">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
