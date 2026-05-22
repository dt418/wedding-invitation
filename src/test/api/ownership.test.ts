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

describe("Events API - Ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importListRoute() {
    const { GET } = await import("@/app/api/events/route");
    return { GET };
  }

  async function importDetailRoute() {
    const { GET } = await import("@/app/api/events/[id]/route");
    return { GET };
  }

  function makeListRequest(cookies: Record<string, string> = {}) {
    return new NextRequest("http://localhost/api/events", {
      headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ") },
    });
  }

  function makeDetailRequest(cookies: Record<string, string> = {}) {
    return new NextRequest("http://localhost/api/events/evt_123", {
      headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ") },
    });
  }

  it("GET /api/events returns 401 when no token", async () => {
    const { GET } = await importListRoute();
    const res = await GET(makeListRequest());
    expect(res.status).toBe(401);
  });

  it("GET /api/events returns own events", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([{ id: "evt_1", userId: "user_1", slug: "s1" }]),
        }),
      }),
    } as never);

    const { GET } = await importListRoute();
    const res = await GET(makeListRequest({ wedding_token: "valid_token" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
  });

  it("GET /api/events/[id] returns 401 when no token", async () => {
    const { GET } = await importDetailRoute();
    const res = await GET(makeDetailRequest(), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(401);
  });

  it("GET /api/events/[id] returns 404 when event not owned", async () => {
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

    const { GET } = await importDetailRoute();
    const res = await GET(makeDetailRequest({ wedding_token: "valid_token" }), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/events/[id] returns event when owned", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "evt_123", userId: "user_1", slug: "s1" }]),
        }),
      }),
    } as never);

    const { GET } = await importDetailRoute();
    const res = await GET(makeDetailRequest({ wedding_token: "valid_token" }), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(200);
  });
});

describe("Templates API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { GET } = await import("@/app/api/templates/route");
    return { GET };
  }

  it("GET /api/templates returns empty array", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    } as never);

    const { GET } = await importRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("GET /api/templates returns templates with grouped variants", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.select)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: "t1", name: "A" },
            { id: "t2", name: "B" },
          ]),
        }),
      } as never)
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: "v1", templateId: "t1", name: "v1" },
            { id: "v2", templateId: "t1", name: "v2" },
          ]),
        }),
      } as never);

    const { GET } = await importRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].variants).toHaveLength(2);
    expect(data[1].variants).toHaveLength(0);
  });
});

describe("Public Invite API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { GET } = await import("@/app/api/invites/[code]/route");
    return { GET };
  }

  it("GET /api/invites/[code] returns 404 when code not found", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const { GET } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/badcode");
    const res = await GET(req, { params: Promise.resolve({ code: "badcode" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/invites/[code] returns 404 when event missing", async () => {
    const { db } = await import("@/db");
    let callCount = 0;

    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(async () => {
            callCount++;
            if (callCount === 1) {
              return [{ id: "inv_1", eventId: "evt_123", inviteCode: "ABC123", guestId: "g1", status: "sent" }];
            } else if (callCount === 2) {
              return [{ id: "g1", name: "Jane" }];
            } else if (callCount === 3) {
              return [];
            }
            return [];
          }),
        }),
      }),
    }) as never);

    const { GET } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/ABC123");
    const res = await GET(req, { params: Promise.resolve({ code: "ABC123" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/invites/[code] returns full payload", async () => {
    const { db } = await import("@/db");
    let callCount = 0;

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return { limit: vi.fn().mockResolvedValue([{ id: "inv_1", eventId: "evt_123", inviteCode: "ABC123", guestId: "g1", status: "sent" }]) };
          } else if (callCount === 2) {
            return { limit: vi.fn().mockResolvedValue([{ id: "g1", name: "Jane", relation: "friend" }]) };
          } else if (callCount === 3) {
            return { limit: vi.fn().mockResolvedValue([{ id: "evt_123", templateId: "t1", title: "Wedding", slug: "jane-john", eventDate: "2026-06-01", eventTime: "14:00", venueName: "Hall", venueAddress: "123 St", mapUrl: null, description: null }]) };
          } else if (callCount === 4) {
            return [{ id: "sec_1", sectionType: "hero", defaultContent: "Welcome", order: 1, templateId: "t1" }];
          } else if (callCount === 5) {
            return [{ id: "ov1", sectionType: "hero", customContent: "Custom", eventId: "evt_123" }];
          } else if (callCount === 6) {
            return [{ id: "v1", isDefault: true }];
          }
          return [];
        }),
      }),
    } as never);

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{}]),
      }),
    } as never);

    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      }),
    } as never);

    const { GET } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/ABC123");
    const res = await GET(req, { params: Promise.resolve({ code: "ABC123" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.invite).toBeDefined();
    expect(data.event).toBeDefined();
    expect(data.sections).toBeDefined();
    expect(data.variant).toBeDefined();
  });
});

describe("Create Event API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { POST } = await import("@/app/api/events/route");
    return { POST };
  }

  it("POST /api/events returns 401 when unauthenticated", async () => {
    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/events", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("POST /api/events returns 400 on invalid body", async () => {
    const { verifyToken } = await import("@/lib/auth");
    vi.mocked(verifyToken).mockReturnValue({ userId: "u1", email: "a@b.com", role: "user" });

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/events", {
      method: "POST",
      headers: { cookie: "wedding_token=valid_token" },
      body: JSON.stringify({ title: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/events returns 409 on slug conflict", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "u1", email: "a@b.com", role: "user" });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "existing" }]),
        }),
      }),
    } as never);

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/events", {
      method: "POST",
      headers: { cookie: "wedding_token=valid_token" },
      body: JSON.stringify({
        title: "Test",
        slug: "taken",
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        eventDate: "2026-06-01",
        eventTime: "14:00",
        venueName: "Hall",
        venueAddress: "123 St",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("POST /api/events returns 201 on success", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "u1", email: "a@b.com", role: "user" });
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "evt_new", slug: "new-event" }]),
      }),
    } as never);

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/events", {
      method: "POST",
      headers: { cookie: "wedding_token=valid_token" },
      body: JSON.stringify({
        title: "Test",
        slug: "new-event",
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        eventDate: "2026-06-01",
        eventTime: "14:00",
        venueName: "Hall",
        venueAddress: "123 St",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});