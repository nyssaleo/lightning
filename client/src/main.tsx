import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { WebLNProvider } from "./contexts/WebLNContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { TransactionProvider } from "./contexts/TransactionContext";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CurrencyProvider>
        <WebLNProvider>
          <TransactionProvider>
            <App />
            <Toaster />
          </TransactionProvider>
        </WebLNProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
