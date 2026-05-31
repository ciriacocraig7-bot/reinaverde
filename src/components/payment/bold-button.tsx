"use client";

import { useEffect, useRef, useState } from "react";

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
  /**
   * Se llama una vez que el botón Bold está visible y listo para clickear.
   * NO se llama al hacer click — eso ocurre dentro del iframe de Bold.
   * Para limpiar carrito o navegar, usa la página de confirmación.
   */
  onReady?: () => void;
  /**
   * Se llama si Bold no logra cargar el script en 8 segundos (network, CSP).
   * El componente muestra un fallback automáticamente.
   */
  onError?: (msg: string) => void;
}

const BOLD_SCRIPT_URL = "https://checkout.bold.co/library/boldPaymentButton.js";

export function BoldPaymentButton(props: BoldPaymentButtonProps) {
  const {
    apiKey, amount, currency = "COP", orderId, integritySignature,
    description, tax, redirectionUrl, customerData, billingAddress,
    buttonStyle = "dark-L", onReady, onError,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Limpiar render previo (re-mount al cambiar config)
    containerRef.current.innerHTML = "";
    setStatus("loading");
    setErrorMsg(null);

    // Diagnóstico: si las props críticas faltan, no llamar a Bold.
    if (!apiKey) {
      const msg = "Falta apiKey de Bold (NEXT_PUBLIC_BOLD_API_KEY no configurada).";
      setStatus("error"); setErrorMsg(msg); onError?.(msg);
      return;
    }
    if (!integritySignature) {
      const msg = "Falta firma de integridad. Reintenta crear la orden.";
      setStatus("error"); setErrorMsg(msg); onError?.(msg);
      return;
    }

    // Construimos el script con los data-* del botón.
    const buttonScript = document.createElement("script");
    buttonScript.setAttribute("data-bold-button", buttonStyle);
    buttonScript.setAttribute("data-api-key", apiKey);
    buttonScript.setAttribute("data-amount", String(amount));
    buttonScript.setAttribute("data-currency", currency);
    buttonScript.setAttribute("data-order-id", orderId);
    buttonScript.setAttribute("data-integrity-signature", integritySignature);
    if (description) buttonScript.setAttribute("data-description", description);
    if (tax) buttonScript.setAttribute("data-tax", tax);
    if (redirectionUrl) buttonScript.setAttribute("data-redirection-url", redirectionUrl);
    if (customerData) buttonScript.setAttribute("data-customer-data", JSON.stringify(customerData));
    if (billingAddress) buttonScript.setAttribute("data-billing-address", JSON.stringify(billingAddress));
    buttonScript.src = BOLD_SCRIPT_URL;

    let readyFired = false;
    const markReady = () => {
      if (readyFired) return;
      readyFired = true;
      setStatus("ready");
      onReady?.();
    };

    buttonScript.onload = markReady;
    buttonScript.onerror = () => {
      const msg = "No se pudo cargar el procesador Bold. Revisa tu conexión.";
      setStatus("error"); setErrorMsg(msg); onError?.(msg);
    };

    containerRef.current.appendChild(buttonScript);

    // Si el script Bold ya estaba cargado en la página (HMR / re-render),
    // su `<script>` no triggea onload de nuevo. Marcamos ready a los 1.5s
    // si Bold ya inyectó algo en el container.
    const earlyReadyTimer = window.setTimeout(() => {
      if (readyFired || !containerRef.current) return;
      const hasButton = containerRef.current.querySelector(
        "[data-bold-pay-button], iframe, button"
      );
      if (hasButton) markReady();
    }, 1500);

    // Watchdog: si en 8s no hay nada, declaramos error visible.
    const watchdog = window.setTimeout(() => {
      if (readyFired || !containerRef.current) return;
      const hasContent = containerRef.current.childElementCount > 1; // > 1 = botón inyectado
      if (!hasContent) {
        const msg = "El botón Bold no respondió en 8 segundos. Verifica el bloqueador de scripts o reintenta.";
        setStatus("error"); setErrorMsg(msg); onError?.(msg);
      }
    }, 8000);

    return () => {
      window.clearTimeout(earlyReadyTimer);
      window.clearTimeout(watchdog);
    };
  }, [apiKey, amount, currency, orderId, integritySignature, description, tax,
      redirectionUrl, customerData, billingAddress, buttonStyle, onReady, onError]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full flex justify-center min-h-[52px]" />

      {status === "loading" && (
        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55 text-center">
          Cargando procesador de pago…
        </p>
      )}

      {status === "error" && (
        <div className="mt-3 border border-error/40 bg-error-soft/40 p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-error mb-2">
            ✕ Bold no respondió
          </p>
          <p className="font-serif text-[14px] text-ink/80 leading-snug">
            {errorMsg}
          </p>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-wider text-ink/55">
            Reintenta refrescando la página. Si persiste, contacta a soporte
            con el número de pedido <span className="text-ink font-sans">{orderId}</span>.
          </p>
        </div>
      )}
    </div>
  );
}
