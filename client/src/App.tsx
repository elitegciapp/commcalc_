import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import {
  ToastProvider,
  ToastViewport,
} from "@components/ui/toast";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Splash from "@/pages/Splash";
import { AnimatedBackground } from "@/components/animated-background";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/calculator" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AnimatedBackground />
        <div className="relative z-10">
          <Router />
          <ToastViewport />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;

