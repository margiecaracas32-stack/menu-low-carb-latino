"use client";

import { useEffect } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { reportProductError } from "../../lib/analytics";
import "./internal.css";

export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportProductError(error, "product_error_boundary", "/app");
  }, [error]);

  return (
    <main className="internal-fatal paper">
      <span><CircleAlert/></span>
      <p>NO PERDISTE TU SEMANA</p>
      <h1>Algo interrumpió esta pantalla.</h1>
      <p>Tus preferencias siguen guardadas. Intenta abrirla nuevamente.</p>
      <button type="button" onClick={reset}>Intentar de nuevo <RefreshCw/></button>
    </main>
  );
}
