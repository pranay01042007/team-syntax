import React from "react";
import { ShieldCheck, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div style={{ maxWidth: "340px" }}>
            <h4 style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              MarketHub
            </h4>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              A secure, multi-tenant e-commerce platform built for the Build Secure 24 hackathon by Team Syntax (Team 71).
            </p>
          </div>

          <div>
            <h5 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.75rem" }}>Security Standards</h5>
            <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>✓ Bcrypt Password Hashing</li>
              <li>✓ Role-Based Access Control (RBAC)</li>
              <li>✓ Strict IDOR Resource Isolation</li>
              <li>✓ HTTP Security Headers (X-Frame, nosniff, CSP)</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.75rem" }}>Demo Quick Access</h5>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              <p><strong>Admin:</strong> admin@markethub.com / Admin@123</p>
              <p><strong>Vendor:</strong> techvendor@markethub.com / Vendor@123</p>
              <p><strong>Customer:</strong> customer@markethub.com / Customer@123</p>
            </div>
          </div>
        </div>

        <div className="footer-copy">
          <p>© 2026 MarketHub — Build Secure 24 Hackathon • Abhedya (VBIT Cybersecurity Forum)</p>
        </div>
      </div>
    </footer>
  );
};
