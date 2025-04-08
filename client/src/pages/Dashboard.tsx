import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardSummary from "@/components/DashboardSummary";
import FoodItem from "@/components/FoodItem";
import SearchAndFilter from "@/components/SearchAndFilter";
import AddFoodModal from "@/components/AddFoodModal";
import NotificationModal from "@/components/NotificationModal";
import ConsumeItemModal from "@/components/ConsumeItemModal";
import { useAppContext } from "@/contexts/AppContext";
import { FoodItem as FoodItemType } from "@shared/schema";
import { getDaysUntilExpiration } from "@/lib/utils";

const Dashboard = () => {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItemType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("expiration"); // expiration, recent, name
  const { showAddButton } = useAppContext();

  // Fetch food items
  const { data: foodItems = [], isLoading, error, refetch } = useQuery<FoodItemType[]>({
    queryKey: ['/api/food-items'],
    staleTime: 60000, // 1 minute
  });

  // Process auto-consumption once per day (in a real app, this would be a scheduled server job)
  useEffect(() => {
    const lastProcessed = localStorage.getItem('lastAutoConsumptionProcessed');
    const today = new Date().toDateString();
    
    if (lastProcessed !== today) {
      fetch('/api/process-auto-consumption', { method: 'POST' })
        .then(response => {
          if (response.ok) {
            localStorage.setItem('lastAutoConsumptionProcessed', today);
            refetch(); // Refresh food items after auto-consumption
          }
        })
        .catch(error => console.error('Failed to process auto-consumption:', error));
    }
  }, [refetch]);

  // Calculate summary stats
  const totalItems = foodItems.length;
  const expiringItems = foodItems.filter(item => {
    const daysUntil = getDaysUntilExpiration(item.expirationDate);
    return daysUntil >= 0 && daysUntil <= 3;
  }).length;
  const depleted = foodItems.filter(item => item.quantity === 0).length;

  // Filter and sort food items
  const filteredFoodItems = foodItems
    .filter(item => {
      // Apply search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "expiration") {
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      } else if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  // Handle opening consume modal
  const handleConsumeClick = (foodItem: FoodItemType) => {
    setSelectedFoodItem(foodItem);
    setIsConsumeModalOpen(true);
  };

  // Notification button in header
  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">남은 음식 확인</h1>
          <div className="flex space-x-3">
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={handleNotificationClick}
            >
              <span className="material-icons text-neutral-500">notifications</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="material-icons text-neutral-500">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Summary */}
      <DashboardSummary 
        totalItems={totalItems}
        expiringItems={expiringItems}
        depleted={depleted}
      />

      {/* Search & Filter */}
      <SearchAndFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Food Items List */}
      <section className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <span className="material-icons animate-spin text-primary">refresh</span>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            음식 목록을 불러오는 데 실패했습니다.
          </div>
        ) : filteredFoodItems.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">
            {searchQuery || selectedCategory !== "all" ? 
              "검색 결과가 없습니다." : 
              "등록된 음식이 없습니다. 음식을 추가해보세요!"}
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredFoodItems.map((item) => (
              <FoodItem 
                key={item.id} 
                item={item} 
                onConsumeClick={() => handleConsumeClick(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <AddFoodModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refetch();
          toast({
            title: "음식이 등록되었습니다",
            description: "목록에서 확인하실 수 있습니다.",
          });
        }}
      />

      <NotificationModal 
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {selectedFoodItem && (
        <ConsumeItemModal 
          isOpen={isConsumeModalOpen}
          onClose={() => setIsConsumeModalOpen(false)}
          foodItem={selectedFoodItem}
          onSuccess={() => {
            refetch();
            setIsConsumeModalOpen(false);
            toast({
              title: "음식이 소비되었습니다",
              description: `${selectedFoodItem.name}의 수량이 업데이트되었습니다.`,
            });
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
