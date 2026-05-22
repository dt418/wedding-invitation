import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
    execute: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
}));

describe("Events Analytics API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { GET } = await import("@/app/api/events/[id]/analytics/route");
    return { GET };
  }

  function makeRequest(cookies: Record<string, string> = {}) {
    return new NextRequest("http://localhost/api/events/evt_123/analytics", {
      headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ") },
    });
  }

  it("GET returns 401 when no token", async () => {
    const { GET } = await importRoute();
    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(401);
  });

  it("GET returns 404 when event not owned", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const { GET } = await importRoute();
    const res = await GET(makeRequest({ wedding_token: "valid_token" }), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(404);
  });

  it("GET returns analytics data when event owned", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");

    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });

    // Query counter to track which DB call we're handling
    let queryCount = 0;

    // Create mock implementation that handles different query patterns
    const selectImpl = () => {
      queryCount++;

      // Pattern 1: db.select().from().where().limit() - event ownership check
      if (queryCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: "evt_123", userId: "user_1", title: "Test" }]),
            }),
          }),
        };
      }

      // Pattern 2: db.select().from().where() - pageViews (no groupBy)
      if (queryCount === 2) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 10 }]),
          }),
        };
      }

      // Pattern 3: db.select().from().innerJoin().where() - rsvpCount
      if (queryCount === 3) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ count: 5 }]),
            }),
          }),
        };
      }

      // Pattern 4: db.select().from().where().groupBy() - inviteStats
      if (queryCount === 4) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue([{ status: "sent", count: 10 }]),
            }),
          }),
        };
      }

      // Pattern 5: db.select().from().innerJoin().where().groupBy() - attendanceStats
      if (queryCount === 5) {
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                groupBy: vi.fn().mockResolvedValue([{ attendance: "attending", count: 5 }]),
              }),
            }),
          }),
        };
      }

      // Pattern 6: db.select().from().where().groupBy().orderBy().limit() - dailyViews
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([{ date: "2026-05-01", count: 10 }]),
              }),
            }),
          }),
        }),
      };
    };

    vi.mocked(db.select).mockImplementation(selectImpl as never);

    const { GET } = await importRoute();
    const res = await GET(makeRequest({ wedding_token: "valid_token" }), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("pageViews");
    expect(data).toHaveProperty("rsvpCount");
    expect(data).toHaveProperty("inviteStats");
    expect(data).toHaveProperty("attendanceStats");
    expect(data).toHaveProperty("dailyViews");
  });
});