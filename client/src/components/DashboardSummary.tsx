interface DashboardSummaryProps {
  totalItems: number;
  expiringItems: number;
  depleted: number;
}

const DashboardSummary = ({ totalItems, expiringItems, depleted }: DashboardSummaryProps) => {
  return (
    <section className="bg-white p-4 shadow-sm">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-xs text-neutral-500">전체 항목</p>
            <p className="text-xl font-bold text-neutral-900">{totalItems}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-center">
            <p className="text-xs text-neutral-500">유통기한 임박</p>
            <p className="text-xl font-bold text-warning">{expiringItems}</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg text-center">
            <p className="text-xs text-neutral-500">재구매 필요</p>
            <p className="text-xl font-bold text-danger">{depleted}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSummary;
