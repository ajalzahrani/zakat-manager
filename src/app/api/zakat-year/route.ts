import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const year = parseInt(body.year);

    let zakatYear = await prisma.zakatYear.findFirst({
      where: { year },
    });

    if (!zakatYear) {
      zakatYear = await prisma.zakatYear.create({
        data: { year },
      });
    }

    return NextResponse.json(zakatYear);
  } catch {
    return NextResponse.json(
      { error: "Error creating zakat year" },
      { status: 500 }
    );
  }
}
