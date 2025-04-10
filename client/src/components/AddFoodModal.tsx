import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { foodItemWithValidationSchema } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Extend the schema for form validation
const formSchema = foodItemWithValidationSchema.extend({
  expirationDate: z.string().min(1, "유통기한을 선택해주세요")
});

type FormValues = z.infer<typeof formSchema>;

const AddFoodModal = ({ isOpen, onClose, onSuccess }: AddFoodModalProps) => {
  const { toast } = useToast();
  const [autoConsume, setAutoConsume] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unit: "piece",
      category: "refrigerated",
      expirationDate: new Date().toISOString().split('T')[0],
      autoConsume: false,
      dailyConsumptionAmount: 1,
      dailyConsumptionUnit: "piece",
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest('POST', '/api/food-items', {
      ...data,
      autoConsume,
      // 이미 zod에서 coerce.number()를 사용하지만 안전을 위해 변환 유지
      quantity: Number(data.quantity),
      dailyConsumptionAmount: Number(data.dailyConsumptionAmount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-items'] });
      reset();
      onClose();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "음식 등록 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
      console.error('Error adding food item:', error);
    }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const handleAutoConsumeChange = (checked: boolean) => {
    setAutoConsume(checked);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">음식 등록</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-neutral-700">음식 이름</Label>
            <Input 
              id="name"
              {...register("name")} 
              className="w-full p-2 border border-gray-300 rounded-lg" 
              placeholder="예: 계란, 우유, 치킨"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-neutral-700">수량</Label>
              <div className="flex">
                <Input 
                  id="quantity"
                  type="number" 
                  {...register("quantity")} 
                  className="w-full p-2 border border-gray-300 rounded-l-lg" 
                  min="1"
                />
                <select 
                  className="p-2 border border-gray-300 border-l-0 rounded-r-lg bg-gray-50"
                  {...register("unit")}
                >
                  <option value="piece">개</option>
                  <option value="gram">g</option>
                  <option value="kilogram">kg</option>
                  <option value="milliliter">ml</option>
                  <option value="liter">L</option>
                  <option value="serving">인분</option>
                </select>
              </div>
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-neutral-700">카테고리</Label>
              <select 
                id="category"
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                {...register("category")}
              >
                <option value="refrigerated">냉장</option>
                <option value="frozen">냉동</option>
                <option value="fruits_vegetables">과일/채소</option>
                <option value="meat">육류</option>
                <option value="dairy">유제품</option>
                <option value="other">기타</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="expirationDate" className="text-sm font-medium text-neutral-700">유통기한</Label>
            <Input 
              id="expirationDate"
              type="date" 
              {...register("expirationDate")} 
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="autoConsume" className="text-sm font-medium text-neutral-700">자동 소비 설정</Label>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="text-sm">자동 소비 활성화</span>
              <Switch 
                id="autoConsume"
                checked={autoConsume}
                onCheckedChange={handleAutoConsumeChange}
              />
            </div>
          </div>
          
          {autoConsume && (
            <div id="autoConsumptionSettings">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dailyConsumptionAmount" className="text-sm font-medium text-neutral-700">소비량/일</Label>
                  <Input 
                    id="dailyConsumptionAmount"
                    type="number" 
                    {...register("dailyConsumptionAmount")} 
                    className="w-full p-2 border border-gray-300 rounded-lg" 
                    min="1"
                  />
                  {errors.dailyConsumptionAmount && <p className="text-red-500 text-xs mt-1">{errors.dailyConsumptionAmount.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="dailyConsumptionUnit" className="text-sm font-medium text-neutral-700">단위</Label>
                  <select 
                    id="dailyConsumptionUnit"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    {...register("dailyConsumptionUnit")}
                  >
                    <option value="piece">개</option>
                    <option value="gram">g</option>
                    <option value="milliliter">ml</option>
                    <option value="serving">인분</option>
                  </select>
                  {errors.dailyConsumptionUnit && <p className="text-red-500 text-xs mt-1">{errors.dailyConsumptionUnit.message}</p>}
                </div>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "등록 중..." : "등록하기"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFoodModal;
