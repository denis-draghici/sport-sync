import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const payload = await request.json()

  if (payload.type === "INSERT" && payload.table === "users" && payload.schema === "auth") {
    const { id, email, raw_user_meta_data } = payload.record

    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email,
        name: raw_user_meta_data?.full_name ?? email.split("@")[0],
        avatarUrl: raw_user_meta_data?.avatar_url ?? null,
      },
      update: {},
    })
  }

  return NextResponse.json({ ok: true })
}
