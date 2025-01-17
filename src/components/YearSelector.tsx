"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function YearSelector() {
  const [year, setYear] = useState(new Date().getFullYear());
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/zakat-year", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/zakat/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to create year:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="year" className="block text-sm font-medium mb-2">
          Select Year
        </label>
        <input
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-md"
          min="1900"
          max="2100"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
        Create or View Year Registry
      </button>
    </form>
  );
}
