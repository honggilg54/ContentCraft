import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import FoodList from "@/pages/FoodList";
import ShoppingCart from "@/pages/ShoppingCart";
import Profile from "@/pages/Profile";
import { AppProvider } from "@/contexts/AppContext";
import BottomNavigation from "@/components/BottomNavigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/food-list" component={FoodList} />
      <Route path="/shopping-cart" component={ShoppingCart} />
      <Route path="/profile" component={Profile} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="flex flex-col h-screen bg-gray-100">
          <div className="flex-1 overflow-auto pb-16">
            <Router />
          </div>
          <BottomNavigation />
        </div>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
