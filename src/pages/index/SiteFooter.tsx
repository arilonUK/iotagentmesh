
import React from "react";
import { Link } from "react-router-dom";

const SiteFooter = () => (
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
);

export default SiteFooter;
