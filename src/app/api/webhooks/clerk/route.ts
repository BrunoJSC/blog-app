import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const payload = await req.json();

  if (payload.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = payload.data;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {},
      create: {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      },
    });
  }

  return NextResponse.json({ status: "ok" });
}
