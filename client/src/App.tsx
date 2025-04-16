import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import DashboardPage from "@/pages/DashboardPage";
import NotFound from "@/pages/not-found";
import { WebLNProvider } from "@/contexts/WebLNContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TransactionProvider>
          <CurrencyProvider>
            <WebLNProvider>
              <Router />
              <Toaster />
            </WebLNProvider>
          </CurrencyProvider>
        </TransactionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
