import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/db", () => ({
  db: {
  query: {
    events: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    sections: {
      findMany: vi.fn(),
    },
    templates: {
      findMany: vi.fn(),
    },
    templateVariants: {
      findMany: vi.fn(),
    },
    templateSections: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    invites: {
      findFirst: vi.fn(),
    },
    guests: {
      findFirst: vi.fn(),
    },
    rsvps: {
      findFirst: vi.fn(),
    },
  },
    transaction: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
}));

describe("Events Sections API - Ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { GET, PATCH } = await import("@/app/api/events/[id]/sections/route");
    return { GET, PATCH };
  }

  function makeRequest(cookies: Record<string, string> = {}) {
    const req = new NextRequest("http://localhost/api/events/evt_123/sections", {
      headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ") },
    });
    return req;
  }

  it("returns 401 when no token", async () => {
    const { GET } = await importRoute();
    const req = makeRequest();
    const res = await GET(req, { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when event belongs to different user", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.query.events.findFirst).mockResolvedValue(null);

    const { GET } = await importRoute();
    const req = makeRequest({ wedding_token: "valid_token" });
    const res = await GET(req, { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(404);
  });

  it("returns sections when user owns event", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.query.events.findFirst).mockResolvedValue({ id: "evt_123", userId: "user_1", name: "Test", slug: "test" });
    vi.mocked(db.query.sections.findMany).mockResolvedValue([
      { id: "sec_1", sectionType: "hero", defaultContent: "Welcome", order: 1, isRequired: true },
    ]);
    vi.mocked(db.query.templateSections.findMany).mockResolvedValue([]);

    const { GET } = await importRoute();
    const req = makeRequest({ wedding_token: "valid_token" });
    const res = await GET(req, { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("PATCH returns 401 when no token", async () => {
    const { PATCH } = await importRoute();
    const req = makeRequest();
    const res = await PATCH(req, { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(401);
  });

  it("PATCH returns 404 when event belongs to different user", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.query.events.findFirst).mockResolvedValue(null);

    const { PATCH } = await importRoute();
    const req = makeRequest({ wedding_token: "valid_token" });
    const res = await PATCH(req, { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(404);
  });
});

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
    vi.mocked(db.query.events.findMany).mockResolvedValue([{ id: "evt_1", userId: "user_1", slug: "s1" }]);

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
    vi.mocked(db.query.events.findFirst).mockResolvedValue(null);

    const { GET } = await importDetailRoute();
    const res = await GET(makeDetailRequest({ wedding_token: "valid_token" }), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/events/[id] returns event when owned", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.query.events.findFirst).mockResolvedValue({ id: "evt_123", userId: "user_1", slug: "s1" });

    const { GET } = await importDetailRoute();
    const res = await GET(makeDetailRequest({ wedding_token: "valid_token" }), { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(200);
  });
});

describe("Events Analytics API - Ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { GET } = await import("@/app/api/events/[id]/analytics/route");
    return { GET };
  }

  function makeRequest(cookies: Record<string, string> = {}) {
    const req = new NextRequest("http://localhost/api/events/evt_123/analytics", {
      headers: { cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ") },
    });
    return req;
  }

  it("returns 401 when no token", async () => {
    const { GET } = await importRoute();
    const req = makeRequest();
    const res = await GET(req, { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when event belongs to different user", async () => {
    const { verifyToken } = await import("@/lib/auth");
    const { db } = await import("@/db");
    vi.mocked(verifyToken).mockReturnValue({ userId: "user_1", email: "test@test.com", role: "user" });
    vi.mocked(db.query.events.findFirst).mockResolvedValue(null);

    const { GET } = await importRoute();
    const req = makeRequest({ wedding_token: "valid_token" });
    const res = await GET(req, { params: Promise.resolve({ id: "evt_123" }) });
    expect(res.status).toBe(404);
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
    vi.mocked(db.query.templates.findMany).mockResolvedValue([]);

    const { GET } = await importRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
    expect(db.query.templateVariants.findMany).not.toHaveBeenCalled();
  });

  it("GET /api/templates returns templates with grouped variants", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.templates.findMany).mockResolvedValue([
      { id: "t1", name: "A" },
      { id: "t2", name: "B" },
    ] as never);
    vi.mocked(db.query.templateVariants.findMany).mockResolvedValue([
      { id: "v1", templateId: "t1", name: "v1" },
      { id: "v2", templateId: "t1", name: "v2" },
    ] as never);

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
    vi.mocked(db.query.invites.findFirst).mockResolvedValue(null);

    const { GET } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/badcode");
    const res = await GET(req, { params: Promise.resolve({ code: "badcode" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/invites/[code] returns 404 when event missing", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.invites.findFirst).mockResolvedValue({
      id: "inv_1", eventId: "evt_123", inviteCode: "ABC123", guestId: "g1", status: "sent",
    });
    vi.mocked(db.query.guests.findFirst).mockResolvedValue({ id: "g1", name: "Jane" });
    vi.mocked(db.query.events.findFirst).mockResolvedValue(null);

    const { GET } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/ABC123");
    const res = await GET(req, { params: Promise.resolve({ code: "ABC123" }) });
    expect(res.status).toBe(404);
  });

  it("GET /api/invites/[code] returns full payload", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.invites.findFirst).mockResolvedValue({
      id: "inv_1", eventId: "evt_123", inviteCode: "ABC123", guestId: "g1", status: "sent",
    });
    vi.mocked(db.query.guests.findFirst).mockResolvedValue({ id: "g1", name: "Jane", relation: "friend" });
    vi.mocked(db.query.events.findFirst).mockResolvedValue({
      id: "evt_123", templateId: "t1", title: "Wedding", slug: "jane-john",
    });
    vi.mocked(db.query.sections.findMany).mockResolvedValue([
      { id: "sec_1", sectionType: "hero", defaultContent: "Welcome", order: 1 },
    ]);
    vi.mocked(db.query.templateSections.findMany).mockResolvedValue([]);
    vi.mocked(db.query.templateVariants.findMany).mockResolvedValue([{ id: "v1", isDefault: true }]);
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

describe("RSVP API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importRoute() {
    const { POST } = await import("@/app/api/invites/[code]/rsvp/route");
    return { POST };
  }

  it("POST /api/invites/[code]/rsvp returns 404 when invite not found", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.invites.findFirst).mockResolvedValue(null);

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/BAD/rsvp", {
      method: "POST",
      body: JSON.stringify({ attendance: "yes", plusOnes: 0 }),
    });
    const res = await POST(req, { params: Promise.resolve({ code: "BAD" }) });
    expect(res.status).toBe(404);
  });

  it("POST /api/invites/[code]/rsvp returns 400 on invalid body", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.invites.findFirst).mockResolvedValue({
      id: "inv_1", inviteCode: "ABC123", eventId: "evt_123",
    });

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/ABC123/rsvp", {
      method: "POST",
      body: JSON.stringify({ attendance: "invalid_attendance" }),
    });
    const res = await POST(req, { params: Promise.resolve({ code: "ABC123" }) });
    expect(res.status).toBe(400);
  });

  it("POST /api/invites/[code]/rsvp returns 500 on transaction failure", async () => {
    const { db } = await import("@/db");
    vi.mocked(db.query.invites.findFirst).mockResolvedValue({
      id: "inv_1", inviteCode: "ABC123", eventId: "evt_123",
    });
    vi.mocked(db.transaction).mockRejectedValue(new Error("DB error"));

    const { POST } = await importRoute();
    const req = new NextRequest("http://localhost/api/invites/ABC123/rsvp", {
      method: "POST",
      body: JSON.stringify({ attendance: "attending", plusOnes: 1, plusOneNames: "Mike" }),
    });
    const res = await POST(req, { params: Promise.resolve({ code: "ABC123" }) });
    expect(res.status).toBe(500);
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
    vi.mocked(db.query.events.findFirst).mockResolvedValue({ id: "existing" } as never);

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
    vi.mocked(db.query.events.findFirst).mockResolvedValue(null);
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