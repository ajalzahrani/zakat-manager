import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ yearId: string; entryId: string }> }
) {
  const resolvedParams = await params;

  try {
    const body = await request.json();
    const entry = await prisma.zakatEntry.update({
      where: { id: resolvedParams.entryId },
      data: {
        name: body.name,
        assetType: body.assetType,
        amount: parseFloat(body.amount),
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating zakat entry:", error);
    return NextResponse.json(
      { error: "Error updating zakat entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ yearId: string; entryId: string }> }
) {
  const resolvedParams = await params;

  try {
    await prisma.zakatEntry.delete({
      where: { id: resolvedParams.entryId },
    });

    return NextResponse.json({ success: true });
  } catch (error: Error | unknown) {
    console.error("Error deleting zakat entry", error);
    return NextResponse.json(
      { error: "Error deleting zakat entry" },
      { status: 500 }
    );
  }
}
