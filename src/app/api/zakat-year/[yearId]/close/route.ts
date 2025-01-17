import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ yearId: string }> }
) {
  const resolvedParams = await params;

  try {
    const year = await prisma.zakatYear.update({
      where: { id: resolvedParams.yearId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    return NextResponse.json(year);
  } catch {
    return NextResponse.json(
      { error: "Error closing zakat year" },
      { status: 500 }
    );
  }
}
