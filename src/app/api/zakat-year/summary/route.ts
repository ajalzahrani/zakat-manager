import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const years = await prisma.zakatYear.findMany({
      include: {
        entries: {
          select: {
            amount: true,
          },
        },
        paidEntries: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        year: "desc",
      },
    });

    return NextResponse.json(years);
  } catch {
    return NextResponse.json(
      { error: "Error fetching zakat years" },
      { status: 500 }
    );
  }
}
