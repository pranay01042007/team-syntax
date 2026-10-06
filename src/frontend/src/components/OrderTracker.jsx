import React from "react";
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react";

export const OrderTracker = ({ orderStatus }) => {
  const steps = [
    { key: "PENDING", label: "Placed", icon: Clock },
    { key: "CONFIRMED", label: "Confirmed", icon: Check },
    { key: "PROCESSING", label: "Processing", icon: Package },
    { key: "SHIPPED", label: "Shipped", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  ];

  const statusUpper = (orderStatus || "PENDING").toUpperCase();

  if (statusUpper === "CANCELLED") {
    return (
      <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
        <XCircle size={22} />
        <div>
          <strong>Order Cancelled:</strong> This order has been voided. Any simulated funds have been released.
        </div>
      </div>
    );
  }

  // Find index of current status
  const currentIndex = steps.findIndex((s) => s.key === statusUpper);
  const activeIndex = currentIndex >= 0 ? currentIndex : 1; // Default to confirmed

  const progressPercent = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div style={{ margin: "2rem 0" }}>
      <div className="order-tracker-timeline">
        <div className="order-tracker-track"></div>
        <div
          className="order-tracker-progress"
          style={{ width: `calc(${progressPercent}% * 0.85)` }}
        ></div>

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          let stepClass = "";
          if (isCompleted) stepClass = "completed";
          else if (isCurrent) stepClass = "current";

          return (
            <div key={step.key} className={`order-step ${stepClass}`}>
              <div className="order-step-icon">
                {isCompleted ? <Check size={20} /> : <StepIcon size={20} />}
              </div>
              <span className="order-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
