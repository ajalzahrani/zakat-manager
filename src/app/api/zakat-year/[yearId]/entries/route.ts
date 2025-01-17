import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ yearId: string }> }
) {
  const resolvedParams = await params;

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 });
    }

    // Validate required fields
    if (!body.name || !body.assetType || !body.amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const yearExists = await prisma.zakatYear.findUnique({
      where: { id: resolvedParams.yearId },
    });

    if (!yearExists) {
      return NextResponse.json({ error: "Year not found" }, { status: 404 });
    }

    const entry = await prisma.zakatEntry.create({
      data: {
        name: body.name,
        assetType: body.assetType,
        amount: parseFloat(body.amount),
        yearId: resolvedParams.yearId,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Error creating zakat entry" },
      { status: 500 }
    );
  }
}
