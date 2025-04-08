import { createContext, useContext, useState, ReactNode } from "react";
import AddFoodModal from "@/components/AddFoodModal";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AppContextType {
  showAddButton: boolean;
  setShowAddButton: (show: boolean) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { toast } = useToast();
  const [showAddButton, setShowAddButton] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/food-items'] });
    toast({
      title: "음식이 등록되었습니다",
      description: "목록에서 확인하실 수 있습니다.",
    });
  };

  return (
    <AppContext.Provider value={{
      showAddButton,
      setShowAddButton,
      isAddModalOpen,
      setIsAddModalOpen
    }}>
      {children}
      <AddFoodModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </AppContext.Provider>
  );
}
