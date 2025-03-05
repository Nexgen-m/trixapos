// TransactionDetails.tsx: Displays transaction information

interface TransactionDetailsProps {
  total: number;
  cart: any[];
  itemDiscounts: number;
  discountPercentage: number;
  formatCurrency: (amount: number) => string;
}

export function TransactionDetails({
  total,
  cart,
  itemDiscounts,
  discountPercentage,
  formatCurrency,
}: TransactionDetailsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border">
      <div className="text-sm font-medium text-gray-500">Original Amount Due</div>
      <div className="text-2xl font-bold text-gray-900">{formatCurrency(total + itemDiscounts)}</div>

      {/* Show discount only if discount is applied */}
      {discountPercentage > 0 && (
        <>
          <div className="mt-2 text-sm font-medium text-red-600">
            Total Discount: {discountPercentage}% (-{formatCurrency(itemDiscounts)})
          </div>

          <hr className="my-2 border-gray-300" />

          {/* Final amount after discount */}
          <div className="text-lg font-semibold text-green-700">
            Amount After Discount: {formatCurrency(total)}
          </div>
        </>
      )}
    </div>
  );
}
