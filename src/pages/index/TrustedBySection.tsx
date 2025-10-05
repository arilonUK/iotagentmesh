import React from "react";

const TrustedBySection = () => (
  <section className="py-16 border-y bg-muted/20">
    <div className="container mx-auto max-w-7xl px-4">
      <p className="text-center text-sm text-muted-foreground mb-8 font-medium">
        TRUSTED BY LEADING COMPANIES WORLDWIDE
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-32 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground"
          >
            COMPANY {i + 1}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBySection;
