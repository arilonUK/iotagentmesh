
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => (
  <section className="iot-section bg-iot-gray-light">
    <div className="container mx-auto max-w-6xl">
      <div className="iot-card p-10 md:p-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your IoT infrastructure?
          </h2>
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
);

export default CtaSection;
