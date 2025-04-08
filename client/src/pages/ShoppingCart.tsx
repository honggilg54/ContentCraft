import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCartItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ShoppingCart = () => {
  const { toast } = useToast();
  
  // Fetch shopping cart items
  const { data: cartItems = [], isLoading, error } = useQuery<ShoppingCartItem[]>({
    queryKey: ['/api/shopping-cart'],
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/shopping-cart/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-cart'] });
      toast({
        title: "항목이 삭제되었습니다",
        description: "장바구니에서 제거되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "항목 삭제 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  });

  const handleRemoveItem = (id: number) => {
    removeMutation.mutate(id);
  };

  const handleBuyAll = () => {
    toast({
      title: "기능 준비 중",
      description: "이 기능은 아직 개발 중입니다.",
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-primary">장바구니</h1>
        </div>
      </header>

      {/* Shopping Cart Items */}
      <section className="container mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <span className="material-icons animate-spin text-primary">refresh</span>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            장바구니를 불러오는 데 실패했습니다.
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">
            <span className="material-icons text-4xl mb-2">shopping_cart</span>
            <p>장바구니가 비어있습니다.</p>
            <p className="text-sm mt-2">소진된 식품이 자동으로 추가됩니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">구매 목록</h2>
              {cartItems.map((item) => (
                <div key={item.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(item.addedAt)} 추가
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm font-medium">{item.quantity} {item.unit}</p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 p-1"
                      >
                        <span className="material-icons text-sm">close</span>
                      </button>
                    </div>
                  </div>
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50">
              <Button 
                onClick={handleBuyAll}
                className="w-full"
              >
                모두 구매하기
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShoppingCart;
