import React from "react";
import { useAuth } from "../context/AuthContext";

export default function MpinGate({ onAction, children, style, disabled, ...rest }) {
  const { requireMpinVerification } = useAuth();

  const handleClick = (e) => {
    if (disabled) return;
    const proceed = requireMpinVerification(onAction);
    if (!proceed) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <span onClick={handleClick} style={{ display: "inline-flex", cursor: disabled ? "not-allowed" : "pointer", ...style }} {...rest}>
      {children}
    </span>
  );
}
