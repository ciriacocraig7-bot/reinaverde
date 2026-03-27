"use client";

import { useEffect, useRef } from "react";

interface BoldPaymentButtonProps {
  apiKey: string;
  amount: number;
  currency?: "COP" | "USD";
  orderId: string;
  integritySignature: string;
  description?: string;
  tax?: string;
  redirectionUrl?: string;
  customerData?: {
    email?: string;
    fullName?: string;
    phone?: string;
    dialCode?: string;
    documentNumber?: string;
    documentType?: "CC" | "CE" | "NIT" | "PP" | "TI";
  };
  billingAddress?: {
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  buttonStyle?: "dark-S" | "dark-M" | "dark-L" | "light-S" | "light-M" | "light-L";
  onPaymentStarted?: () => void;
}

export function BoldPaymentButton({
  apiKey,
  amount,
  currency = "COP",
  orderId,
  integritySignature,
  description,
  tax,
  redirectionUrl,
  customerData,
  billingAddress,
  buttonStyle = "dark-L",
  onPaymentStarted,
}: BoldPaymentButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;

    // Limpiar contenido previo
    containerRef.current.innerHTML = "";

    // Cargar script de Bold si no está cargado
    const existingScript = document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]');
    
    const createButton = () => {
      if (!containerRef.current) return;

      const script = document.createElement("script");
      script.setAttribute("data-bold-button", buttonStyle);
      script.setAttribute("data-api-key", apiKey);
      script.setAttribute("data-amount", amount.toString());
      script.setAttribute("data-currency", currency);
      script.setAttribute("data-order-id", orderId);
      script.setAttribute("data-integrity-signature", integritySignature);
      script.src = "https://checkout.bold.co/library/boldPaymentButton.js";

      if (description) {
        script.setAttribute("data-description", description);
      }

      if (tax) {
        script.setAttribute("data-tax", tax);
      }

      if (redirectionUrl) {
        script.setAttribute("data-redirection-url", redirectionUrl);
      }

      if (customerData) {
        script.setAttribute("data-customer-data", JSON.stringify(customerData));
      }

      if (billingAddress) {
        script.setAttribute("data-billing-address", JSON.stringify(billingAddress));
      }

      script.onload = () => {
        scriptLoadedRef.current = true;
        onPaymentStarted?.();
      };

      containerRef.current.appendChild(script);
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://checkout.bold.co/library/boldPaymentButton.js";
      script.async = true;
      script.onload = createButton;
      document.head.appendChild(script);
    } else {
      createButton();
    }

    return () => {
      scriptLoadedRef.current = false;
    };
  }, [apiKey, amount, currency, orderId, integritySignature, description, tax, redirectionUrl, customerData, billingAddress, buttonStyle, onPaymentStarted]);

  return <div ref={containerRef} className="w-full flex justify-center" />;
}
