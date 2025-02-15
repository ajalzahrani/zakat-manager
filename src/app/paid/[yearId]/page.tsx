"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paidEntrySchema,
  ZakatYearData,
  YearStatus,
  type PaidEntryData,
} from "@/lib/schemas";
import {
  createPaidEntry,
  updatePaidEntry,
  deletePaidEntry,
  getPaidYear,
} from "@/app/actions/paid-actions";
import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";

export default function PaidYear({
  params,
  searchParams,
}: {
  params: Promise<{ yearId: string }>;
  searchParams: Promise<{ zakatAmount: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const [entries, setEntries] = useState<PaidEntryData[]>([]);
  const [yearData, setYearData] = useState<ZakatYearData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingEntry, setEditingEntry] = useState<PaidEntryData | null>(null);
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaidEntryData>({
    resolver: zodResolver(paidEntrySchema),
    mode: "onBlur",
  });

  const handleEdit = (entry: PaidEntryData) => {
    setEditingEntry(entry);
    setValue("name", entry.name);
    setValue("amount", entry.amount);
  };

  const handleCancel = () => {
    setEditingEntry(null);
    reset();
  };

  const onSubmit = async (data: PaidEntryData) => {
    try {
      setSubmitError(null);
      if (editingEntry?.id) {
        await updatePaidEntry(editingEntry.id, data);
      } else {
        await createPaidEntry(resolvedParams.yearId, data);
      }
      reset();
      setEditingEntry(null);
      fetchYearData();
    } catch (error: Error | unknown) {
      console.error("Failed to save entry:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save entry"
      );
    }
  };

  useEffect(() => {
    fetchYearData();
  }, [resolvedParams.yearId]);

  const fetchYearData = async () => {
    try {
      const data = await getPaidYear(resolvedParams.yearId);
      if (data) {
        const {
          paidEntries,
          id,
          createdAt,
          updatedAt,
          ...yearDataWithoutEntries
        } = data;
        setYearData(
          yearDataWithoutEntries as {
            status: YearStatus;
            year: number;
            closedAt: Date | null;
          }
        );
        setEntries(paidEntries);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch year data:", error);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    await deletePaidEntry(entryId);
    fetchYearData();
  };

  if (isLoading) return <div>Loading...</div>;

  const totalPaid = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const remainingZakat = (
    parseFloat(resolvedSearchParams.zakatAmount) - totalPaid
  ).toLocaleString("en-US", { minimumFractionDigits: 2 });

  const formattedTotalPaid = totalPaid.toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });

  const formattedZakatAmount = parseFloat(
    resolvedSearchParams.zakatAmount
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-800">
            <span className="text-2xl">←</span> Back
          </button>
          <h1 className="text-3xl font-bold">
            Paid Zakat Registry for Year {yearData?.year}
          </h1>
        </div>
        {yearData?.closedAt && (
          <span
            className={`px-4 py-2 rounded-md ${
              yearData?.closedAt
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
            {yearData?.closedAt ? "CLOSED" : "OPEN"}
          </span>
        )}
      </div>

      {yearData?.closedAt ? (
        <div>
          <div className="mb-8 bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <p>This year is closed. No further changes can be made.</p>
            {yearData?.closedAt && (
              <p className="text-sm text-gray-600 mt-2">
                Closed on: {new Date(yearData.closedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Final Summary</h3>
            <p className="text-2xl font-bold">
              Total Paid: ${formattedTotalPaid}
            </p>
            <p className="text-xl text-gray-600 mt-2">
              Zakat Due: ${formattedZakatAmount}
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4">All Entries</h2>
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 border rounded-md shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{entry.name}</h3>
                    <p className="text-sm text-gray-600">{entry.name}</p>
                  </div>
                  <p className="font-mono">
                    $
                    {entry.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {editingEntry ? "Edit Entry" : "Add New Entry"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  {...register("name")}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  {...register("amount")}
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="text-red-500 text-sm mb-4">{submitError}</div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                  {editingEntry ? "Update Entry" : "Add Entry"}
                </button>
                {editingEntry && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              <p className="text-2xl font-bold">
                Total Paid: ${formattedTotalPaid}
              </p>
              <p className="text-xl text-gray-600 mt-2">
                Remaining Zakat: ${remainingZakat}
              </p>
              <p className="text-xl text-gray-600 mt-2">
                Zakat Due: ${formattedZakatAmount}
              </p>
            </div>

            <h2 className="text-xl font-semibold mb-4">Entries</h2>
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{entry.name}</h3>
                      <p className="text-sm text-gray-600">{entry.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-mono">
                        $
                        {entry.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(entry);
                          }}
                          className="text-blue-500 hover:text-blue-600">
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry?.id ?? "");
                          }}
                          className="text-red-500 hover:text-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
