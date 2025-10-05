
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Free tier with 1,000 devices",
  "No credit card required",
  "Full API access",
  "Community support"
];

const CtaSection = () => (
  <section className="py-20 md:py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
    
    <div className="container relative mx-auto max-w-5xl px-4">
      <div className="rounded-2xl border bg-card p-8 md:p-12 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Ready to build the future of IoT?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Join thousands of developers and enterprises already using IoTAgentMesh to power their connected solutions.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto group">
                Start building for free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Talk to sales
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default CtaSection;
