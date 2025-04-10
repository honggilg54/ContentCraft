import { useLocation, Link } from "wouter";
import { useAppContext } from "@/contexts/AppContext";

const BottomNavigation = () => {
  const [location] = useLocation();
  const { showAddButton, setShowAddButton, setIsAddModalOpen } = useAppContext();

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-2 flex-1 ${location === '/' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">dashboard</span>
            <span className="text-xs mt-1">대시보드</span>
          </a>
        </Link>
        <Link href="/food-list">
          <a className={`flex flex-col items-center py-2 flex-1 ${location === '/food-list' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">list_alt</span>
            <span className="text-xs mt-1">음식 목록</span>
          </a>
        </Link>
        <button 
          className="bg-emerald-600 text-white rounded-full w-14 h-14 flex items-center justify-center -mt-5 shadow-lg"
          onClick={handleAddClick}
        >
          <span className="material-icons">add</span>
        </button>
        <Link href="/shopping-cart">
          <a className={`flex flex-col items-center py-2 flex-1 ${location === '/shopping-cart' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">shopping_cart</span>
            <span className="text-xs mt-1">장바구니</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center py-2 flex-1 ${location === '/profile' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">account_circle</span>
            <span className="text-xs mt-1">내 정보</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
