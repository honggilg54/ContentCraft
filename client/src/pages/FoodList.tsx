import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import SearchAndFilter from "@/components/SearchAndFilter";
import FoodItem from "@/components/FoodItem";
import AddFoodModal from "@/components/AddFoodModal";
import ConsumeItemModal from "@/components/ConsumeItemModal";
import { useAppContext } from "@/contexts/AppContext";
import { FoodItem as FoodItemType } from "@shared/schema";
import { getDaysUntilExpiration } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

const FoodList = () => {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItemType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("expiration"); // expiration, recent, name

  // Fetch food items
  const { data: foodItems = [], isLoading, error, refetch } = useQuery<FoodItemType[]>({
    queryKey: ['/api/food-items'],
    staleTime: 60000, // 1 minute
  });

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

  // Handle deleting a food item
  const handleDeleteItem = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/food-items/${id}`);
      refetch();
      toast({
        title: "음식이 삭제되었습니다",
        description: "목록에서 제거되었습니다.",
      });
    } catch (error) {
      toast({
        title: "음식 삭제 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-600">음식 목록</h1>
        </div>
      </header>

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
            <span className="material-icons animate-spin text-emerald-600">refresh</span>
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
                showDeleteButton
                onDeleteClick={() => handleDeleteItem(item.id)}
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

export default FoodList;
