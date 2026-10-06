import React from "react";

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = String(status).toUpperCase();

  let badgeClass = "badge-pending";
  if (s === "CONFIRMED") badgeClass = "badge-confirmed";
  else if (s === "PROCESSING") badgeClass = "badge-processing";
  else if (s === "SHIPPED") badgeClass = "badge-shipped";
  else if (s === "DELIVERED" || s === "ACTIVE") badgeClass = "badge-delivered";
  else if (s === "CANCELLED" || s === "SUSPENDED" || s === "INACTIVE") badgeClass = "badge-cancelled";

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};
