import { FoodItem as FoodItemType } from "@shared/schema";
import { 
  getExpirationColor, 
  formatDaysUntilExpiration, 
  formatDate, 
  getDaysUntilExpiration, 
  getProgressColor,
  getIndicatorBgColor,
  getIconBgColor,
  getIconColor,
  getFoodIcon
} from "@/lib/utils";

interface FoodItemProps {
  item: FoodItemType;
  onConsumeClick: () => void;
  showDeleteButton?: boolean;
  onDeleteClick?: () => void;
}

const FoodItem = ({ 
  item, 
  onConsumeClick,
  showDeleteButton = false,
  onDeleteClick
}: FoodItemProps) => {
  const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate);
  const isExpired = daysUntilExpiration < 0;
  const isDepleted = item.quantity === 0;
  
  // Calculate progress percentage - how much is left
  const progressPercentage = isDepleted ? 0 : (item.quantity < 10 ? (item.quantity / 10) * 100 : 100);

  // Get border color based on expiration status
  const borderColorClass = isDepleted ? "border-neutral-400" : getExpirationColor(item.expirationDate);

  // Get progress bar color
  const progressColorClass = isDepleted ? "bg-gray-400" : getProgressColor(item.expirationDate);

  // Get indicator background color
  const indicatorBgClass = getIndicatorBgColor(item.expirationDate);

  // Get icon background color
  const iconBgClass = getIconBgColor(item.expirationDate);

  // Get icon color
  const iconColorClass = getIconColor(item.expirationDate);

  // Get icon based on food category and name
  const foodIcon = getFoodIcon(item.category, item.name);

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${borderColorClass} ${isDepleted ? "opacity-75" : ""}`}>
      <div className="grid grid-cols-5 p-3">
        <div className="col-span-3 flex items-center">
          <div className={`w-12 h-12 rounded-lg ${iconBgClass} mr-3 flex items-center justify-center`}>
            <span className={`material-icons ${iconColorClass}`}>{foodIcon}</span>
          </div>
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <div className="flex items-center">
              {isDepleted ? (
                <span className="bg-neutral-500 text-white text-xs px-1.5 py-0.5 rounded">소진</span>
              ) : isExpired ? (
                <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded">만료됨</span>
              ) : (
                <span className={`${indicatorBgClass} text-xs px-1.5 py-0.5 rounded`}>
                  {formatDaysUntilExpiration(item.expirationDate)}
                </span>
              )}
              <span className="text-xs text-neutral-500 ml-1">{formatDate(item.expirationDate)}</span>
            </div>
          </div>
        </div>
        <div className="col-span-2 flex flex-col items-end justify-center">
          <div className="text-sm flex items-center mb-1">
            <span className="text-neutral-900 font-medium">{item.quantity} {item.unit}</span>
            <span className="text-neutral-500 text-xs ml-1">남음</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`${progressColorClass} h-1.5 rounded-full`} 
              style={{width: `${progressPercentage}%`}}
            ></div>
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 flex justify-between items-center">
        <div className="flex items-center">
          {isDepleted ? (
            <>
              <span className="material-icons text-emerald-600 text-sm mr-1">shopping_cart</span>
              <span className="text-xs text-neutral-500">장바구니에 추가됨</span>
            </>
          ) : item.autoConsume ? (
            <>
              <span className="material-icons text-emerald-600 text-sm mr-1">autorenew</span>
              <span className="text-xs text-neutral-500">
                자동소비: {item.dailyConsumptionAmount}{item.dailyConsumptionUnit}/일
              </span>
            </>
          ) : (
            <>
              <span className="material-icons text-neutral-500 text-sm mr-1">close</span>
              <span className="text-xs text-neutral-500">자동소비 없음</span>
            </>
          )}
        </div>
        <div className="flex space-x-2">
          {showDeleteButton && (
            <button 
              className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded-lg"
              onClick={onDeleteClick}
            >
              삭제
            </button>
          )}
          {isDepleted ? (
            <button className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-lg">
              재구매
            </button>
          ) : (
            <button 
              className="bg-gray-100 text-neutral-900 text-xs px-2 py-1 rounded-lg"
              onClick={onConsumeClick}
            >
              사용
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
