"use server";

import { PrismaClient } from "@prisma/client";
import { paidEntrySchema, type PaidEntryData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
const prisma = new PrismaClient();

export async function getPaidYear(yearId: string) {
  const paidYear = await prisma.zakatYear.findUnique({
    where: { id: yearId },
    include: { paidEntries: true },
  });
  return paidYear;
}

export async function createPaidEntry(yearId: string, entry: PaidEntryData) {
  const paidEntry = await prisma.paidEntry.create({
    data: { ...entry, yearId },
  });
  revalidatePath(`/paid/${yearId}`);
  return paidEntry;
}

export async function updatePaidEntry(entryId: string, entry: PaidEntryData) {
  const paidEntry = await prisma.paidEntry.update({
    where: { id: entryId },
    data: entry,
  });
  return paidEntry;
}

export async function deletePaidEntry(entryId: string) {
  await prisma.paidEntry.delete({
    where: { id: entryId },
  });
}
