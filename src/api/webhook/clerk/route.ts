import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { Webhook } from 'svix';


export async function POST(req: Request) {
  const playlod = await req.json();
  const h = await headers();

  const headersObject = {
    'svix-id': h.get('svix-id'),
    'svix-timestamp': h.get('svix-timestamp'),
    'svix-signature': h.get('svix-signature'),
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: any;

  try {
    event = wh.verify(JSON.stringify(playlod), headersObject as Record<string, string>) as any;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'user.created') {
    await prisma.user.create({
      data: {
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address,
        name: event.data.first_name,
      },
    });
  }

  return new Response('Success', { status: 200 });

}