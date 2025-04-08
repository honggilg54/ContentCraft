import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FoodItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConsumeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem: FoodItem;
  onSuccess: () => void;
}

const ConsumeItemModal = ({ isOpen, onClose, foodItem, onSuccess }: ConsumeItemModalProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState(1);

  const consumeMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/food-items/${foodItem.id}/consume`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-items'] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "음식 소비 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
      console.error('Error consuming food item:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast({
        title: "유효하지 않은 수량",
        description: "소비 수량은 0보다 커야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (amount > foodItem.quantity) {
      toast({
        title: "수량 초과",
        description: `사용 가능한 최대 수량은 ${foodItem.quantity}${foodItem.unit}입니다.`,
        variant: "destructive",
      });
      return;
    }

    consumeMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">음식 사용</DialogTitle>
          <DialogClose className="absolute right-4 top-4 p-1">
            <span className="material-icons">close</span>
          </DialogClose>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-lg font-semibold">{foodItem.name}</span>
            </div>
            <p className="text-sm text-neutral-500">현재 남은 양: {foodItem.quantity} {foodItem.unit}</p>
          </div>
          
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">소비할 양</Label>
            <div className="flex">
              <Input 
                id="amount"
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
                max={foodItem.quantity}
                className="w-full p-2 border border-gray-300 rounded-l-lg" 
              />
              <div className="p-2 border border-gray-300 border-l-0 rounded-r-lg bg-gray-50">
                {foodItem.unit}
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-white py-3 rounded-lg font-medium"
            disabled={consumeMutation.isPending}
          >
            {consumeMutation.isPending ? "처리 중..." : "사용 완료"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsumeItemModal;
