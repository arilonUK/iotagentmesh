import React from "react";
import { Factory, Home, Car, Building2, Thermometer, ShoppingCart } from "lucide-react";

const useCases = [
  {
    icon: Factory,
    title: "Industrial IoT",
    description: "Monitor production lines, predictive maintenance, and supply chain optimization.",
    stats: "5000+ factories"
  },
  {
    icon: Home,
    title: "Smart Homes",
    description: "Connect thermostats, lights, security systems, and appliances seamlessly.",
    stats: "2M+ homes"
  },
  {
    icon: Car,
    title: "Connected Vehicles",
    description: "Fleet management, telematics, and autonomous vehicle coordination.",
    stats: "500K+ vehicles"
  },
  {
    icon: Building2,
    title: "Smart Buildings",
    description: "Energy management, HVAC control, and occupancy optimization.",
    stats: "10K+ buildings"
  },
  {
    icon: Thermometer,
    title: "Environmental Monitoring",
    description: "Air quality, weather stations, and agricultural sensors at scale.",
    stats: "50K+ sensors"
  },
  {
    icon: ShoppingCart,
    title: "Retail & Logistics",
    description: "Inventory tracking, smart shelves, and automated warehouses.",
    stats: "1000+ stores"
  }
];

const UseCasesSection = () => (
  <section className="py-20 md:py-32 bg-muted/30">
    <div className="container mx-auto max-w-7xl px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Powering IoT across industries
        </h2>
        <p className="text-lg text-muted-foreground">
          Trusted by leading companies to deliver mission-critical IoT solutions.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon;
          return (
            <div
              key={index}
              className="group rounded-xl border bg-card p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  <p className="text-xs font-medium text-primary">{useCase.stats}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default UseCasesSection;
