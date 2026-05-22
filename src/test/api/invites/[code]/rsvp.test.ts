import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock("@/lib/validators", () => ({
  rsvpSubmitSchema: {
    safeParse: vi.fn(),
  },
}));

describe("RSVP API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { POST } = await import("@/app/api/invites/[code]/rsvp/route");
    return { POST };
  }

  function makeRequest(code: string, body: object) {
    return new NextRequest(`http://localhost/api/invites/${code}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  describe("POST /api/invites/[code]/rsvp", () => {
    it("returns 404 when invite not found", async () => {
      const { db } = await import("@/db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const { POST } = await importRoute();
      const req = makeRequest("NOTFOUND", { attendance: "yes", plusOnes: 0 });
      const res = await POST(req, { params: Promise.resolve({ code: "NOTFOUND" }) });
      expect(res.status).toBe(404);
    });

    it("returns 400 on invalid schema", async () => {
      const { db } = await import("@/db");
      const { rsvpSubmitSchema } = await import("@/lib/validators");

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "inv_1", eventId: "evt_1", inviteCode: "ABC123" }]),
          }),
        }),
      } as never);

      vi.mocked(rsvpSubmitSchema.safeParse).mockReturnValue({
        success: false,
        error: { issues: [{ message: "Invalid attendance value" }] },
      } as never);

      const { POST } = await importRoute();
      const req = makeRequest("ABC123", { attendance: "invalid" });
      const res = await POST(req, { params: Promise.resolve({ code: "ABC123" }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid attendance value");
    });

    it("creates new RSVP when none exists", async () => {
      const { db } = await import("@/db");
      const { rsvpSubmitSchema } = await import("@/lib/validators");

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn()
            .mockReturnValueOnce({
              limit: vi.fn().mockResolvedValue([{ id: "inv_1", eventId: "evt_1", inviteCode: "ABC123" }]),
            })
            .mockReturnValueOnce({
              limit: vi.fn().mockResolvedValue([]),
            }),
        }),
      } as never);

      vi.mocked(rsvpSubmitSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          attendance: "attending",
          plusOnes: 2,
          plusOneNames: "John, Jane",
          dietaryRestrictions: "None",
          notes: "Looking forward to it!",
        },
      } as never);

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        const mockTx = {
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: "rsvp_1", attendance: "attending" }]),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{}]),
              }),
            }),
          }),
        };
        await cb(mockTx as never);
      });

      const { POST } = await importRoute();
      const req = makeRequest("ABC123", {
        attendance: "attending",
        plusOnes: 2,
        plusOneNames: "John, Jane",
        dietaryRestrictions: "None",
        notes: "Looking forward to it!",
      });
      const res = await POST(req, { params: Promise.resolve({ code: "ABC123" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.rsvp).toBeDefined();
    });

    it("updates existing RSVP when one exists", async () => {
      const { db } = await import("@/db");
      const { rsvpSubmitSchema } = await import("@/lib/validators");

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn()
            .mockReturnValueOnce({
              limit: vi.fn().mockResolvedValue([{ id: "inv_1", eventId: "evt_1", inviteCode: "ABC123" }]),
            })
            .mockReturnValueOnce({
              limit: vi.fn().mockResolvedValue([{ id: "rsvp_existing", attendance: "yes" }]),
            }),
        }),
      } as never);

      vi.mocked(rsvpSubmitSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          attendance: "maybe",
          plusOnes: 1,
          plusOneNames: "Guest",
          dietaryRestrictions: "Vegetarian",
          notes: "Updated response",
        },
      } as never);

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        const mockTx = {
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([{ id: "rsvp_existing" }]),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: "rsvp_existing", attendance: "maybe" }]),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{}]),
            }),
          }),
        };
        await cb(mockTx as never);
      });

      const { POST } = await importRoute();
      const req = makeRequest("ABC123", {
        attendance: "maybe",
        plusOnes: 1,
        plusOneNames: "Guest",
        dietaryRestrictions: "Vegetarian",
        notes: "Updated response",
      });
      const res = await POST(req, { params: Promise.resolve({ code: "ABC123" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("returns 500 on transaction error", async () => {
      const { db } = await import("@/db");

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "inv_1", eventId: "evt_1", inviteCode: "ABC123" }]),
          }),
        }),
      } as never);

      vi.mocked(db.transaction).mockRejectedValue(new Error("Database connection failed"));

      const { POST } = await importRoute();
      const req = makeRequest("ABC123", { attendance: "yes", plusOnes: 0 });
      const res = await POST(req, { params: Promise.resolve({ code: "ABC123" }) });
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Internal server error");
    });
  });
});