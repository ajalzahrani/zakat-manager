import { z } from "zod";

export enum AssetType {
  INCOME = "INCOME",
  SAVINGS = "SAVINGS",
  GOLD = "GOLD",
  SILVER = "SILVER",
  STOCKS = "STOCKS",
  BUSINESS_ASSETS = "BUSINESS_ASSETS",
  OTHER = "OTHER",
}

export enum YearStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export const zakatYearSchema = z.object({
  year: z.number().min(2020, "Year must be at least 2020"),
  status: z.nativeEnum(YearStatus),
  closedAt: z.date().nullable(),
});

export type ZakatYearData = z.infer<typeof zakatYearSchema>;

export const zakatEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  assetType: z.nativeEnum(AssetType),
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed)) {
        throw new Error("Amount must be a valid number");
      }
      return parsed;
    }),
});

export type ZakatEntryData = z.infer<typeof zakatEntrySchema>;
