import { Dispatch, SetStateAction } from "react";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
}

const SearchAndFilter = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy
}: SearchAndFilterProps) => {
  const categories = [
    { id: "all", name: "전체" },
    { id: "refrigerated", name: "냉장" },
    { id: "frozen", name: "냉동" },
    { id: "fruits_vegetables", name: "과일/채소" },
    { id: "meat", name: "육류" },
    { id: "dairy", name: "유제품" },
    { id: "other", name: "기타" }
  ];

  return (
    <section className="container mx-auto p-4">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="flex items-center">
          <span className="material-icons text-neutral-500 mr-2">search</span>
          <input 
            type="text" 
            placeholder="음식 검색" 
            className="flex-1 text-sm outline-none" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex overflow-x-auto py-2 space-x-2 mb-2">
        {categories.map(category => (
          <button 
            key={category.id}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap shadow-sm ${
              selectedCategory === category.id 
                ? "bg-emerald-600 text-white" 
                : "bg-white text-neutral-900"
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Heading and Sort */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold">식품 목록</h2>
        <div className="flex items-center">
          <span className="text-sm text-neutral-500 mr-2">정렬:</span>
          <select 
            className="text-sm bg-white border border-gray-200 rounded px-2 py-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="expiration">유통기한 임박순</option>
            <option value="recent">최근 등록순</option>
            <option value="name">이름순</option>
          </select>
        </div>
      </div>
    </section>
  );
};

export default SearchAndFilter;
