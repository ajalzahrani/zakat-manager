import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ yearId: string }> }
) {
  const resolvedParams = await params;

  try {
    const zakatYear = await prisma.zakatYear.findUnique({
      where: { id: resolvedParams.yearId },
      include: { entries: true },
    });

    if (!zakatYear) {
      return NextResponse.json({ error: "Year not found" }, { status: 404 });
    }

    return NextResponse.json(zakatYear);
  } catch {
    return NextResponse.json(
      { error: "Error fetching zakat year" },
      { status: 500 }
    );
  }
}
