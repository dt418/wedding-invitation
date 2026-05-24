import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests, invites, events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { guestImportRowSchema } from "@/lib/validators";
import { generateInviteCode, generateInviteUrl } from "@/lib/invite-code";
import { generateQrDataUrl } from "@/lib/qr";
import { eq, and } from "drizzle-orm";
import Papa from "papaparse";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .limit(1);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json(
      { error: "Failed to parse CSV. Check format." },
      { status: 400 }
    );
  }

  type Row = Record<string, string>;
  const rows = parsed.data as Row[];

  const successRows: Array<{
    row: number;
    name: string;
    inviteCode: string;
    inviteUrl: string;
  }> = [];
  const failedRows: Array<{ row: number; name?: string; error: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const parsedRow = guestImportRowSchema.safeParse({
      name: row.name || row.Name || row.Họ_tên,
      email: row.email || row.Email || row["E-mail"],
      phone: row.phone || row.Phone || row.Số_điện_thoại,
      relation: row.relation || row.Relation || row["Phía"],
      gender: row.gender || row.Gender || row.Giới_tính,
      tableNumber: row.tableNumber ? parseInt(row.tableNumber, 10) : undefined,
      seatCount: row.seatCount ? parseInt(row.seatCount, 10) : undefined,
      groupName: row.groupName || row.Group,
      notes: row.notes || row.Notes || row.Ghi_chú,
    });

    if (!parsedRow.success) {
      failedRows.push({
        row: rowNum,
        name: row.name || row.Name,
        error: parsedRow.error.issues[0].message,
      });
      continue;
    }

    try {
      await db.transaction(async (tx) => {
        const [guest] = await tx
          .insert(guests)
          .values({
            eventId,
            ...parsedRow.data,
          })
          .returning();

        const inviteCode = generateInviteCode();
        const inviteUrl = generateInviteUrl(event.slug, inviteCode);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const qrCodeUrl = await generateQrDataUrl(`${baseUrl}${inviteUrl}`);

        await tx.insert(invites).values({
          eventId,
          guestId: guest.id,
          inviteCode,
          inviteUrl,
          qrCodeUrl,
          status: "pending",
        });

        successRows.push({
          row: rowNum,
          name: parsedRow.data.name,
          inviteCode,
          inviteUrl,
        });
      });
    } catch {
      failedRows.push({
        row: rowNum,
        name: parsedRow.data.name,
        error: "Database insert failed",
      });
    }
  }

  return NextResponse.json({
    total: rows.length,
    successCount: successRows.length,
    failedCount: failedRows.length,
    successRows,
    failedRows,
  });
}