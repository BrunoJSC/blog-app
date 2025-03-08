import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("📩 Webhook recebido:", JSON.stringify(payload, null, 2));

    if (!payload || !payload.type || !payload.data) {
      console.error("❌ Erro: Payload inválido.");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (payload.type === "user.created") {
      const { id, email_addresses, first_name, last_name, external_accounts } = payload.data;

      // Verifica se o usuário usou login pelo Google
      const googleAccount = external_accounts?.find((acc: any) => acc.provider === "google");

      // Pega o email do usuário
      const userEmail = email_addresses?.[0]?.email_address || googleAccount?.email_address;

      if (!userEmail) {
        console.error("❌ Erro: Usuário sem e-mail.");
        return NextResponse.json({ error: "User email is missing" }, { status: 400 });
      }

      console.log("🔍 Conta externa detectada:", googleAccount);

      // Salva no banco de dados
      const user = await prisma.user.upsert({
        where: { clerkId: id },
        update: {},
        create: {
          clerkId: id,
          email: userEmail,
          name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        },
      });

      console.log("✅ Usuário salvo no banco:", user);
      return NextResponse.json({ status: "User created/updated" });
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("🔥 Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
