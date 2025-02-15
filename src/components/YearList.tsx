"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type YearSummary = {
  id: string;
  year: number;
  status: "OPEN" | "CLOSED";
  closedAt: string | null;
  paidEntries: {
    amount: number;
  }[];
  entries: {
    amount: number;
  }[];
};

export default function YearList() {
  const [years, setYears] = useState<YearSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const response = await fetch("/api/zakat-year/summary");
      const data = await response.json();
      setYears(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch years:", error);
      setIsLoading(false);
    }
  };

  const calculateZakat = (total: number) => {
    return Number((total * 0.025).toFixed(2)); // Convert back to number after fixing decimals
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="grid grid-cols-5 p-4 font-semibold border-b">
          <div>Year</div>
          <div>Total Assets</div>
          <div>Zakat Due</div>
          <div>Status</div>
          <div>Paid</div>
        </div>
        {years.map((yearData) => {
          const totalAmount = yearData.entries.reduce(
            (sum, entry) => sum + entry.amount,
            0
          );
          const zakatAmount = calculateZakat(totalAmount);

          return (
            <div
              key={yearData.id}
              className="grid grid-cols-5 p-4 border-b hover:bg-gray-50 cursor-pointer">
              <div>{yearData.year}</div>
              <div onClick={() => router.push(`/zakat/${yearData.id}`)}>
                $
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div onClick={() => router.push(`/zakat/${yearData.id}`)}>
                $
                {zakatAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    yearData.status === "CLOSED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {yearData.status}
                </span>
                {yearData.closedAt && (
                  <span className="text-xs text-gray-500 block mt-1">
                    {new Date(yearData.closedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div
                className="pl-2"
                onClick={() =>
                  router.push(`/paid/${yearData.id}?zakatAmount=${zakatAmount}`)
                }>
                {yearData.paidEntries.reduce(
                  (sum, entry) => sum + entry.amount,
                  0
                )
                  ? `$${yearData.paidEntries
                      .reduce((sum, entry) => sum + entry.amount, 0)
                      .toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}`
                  : "$0"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
