// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function createToken(
  payload: Record<string, unknown>,
  options?: { expired?: boolean }
) {
  const builder = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();

  if (options?.expired) {
    builder.setExpirationTime(0);
  } else {
    builder.setExpirationTime("7d");
  }

  return builder.sign(JWT_SECRET);
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("getSession returns null when no cookie is set", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  const { getSession } = await import("../auth");
  const session = await getSession();

  expect(session).toBeNull();
  expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
});

test("getSession returns session payload for a valid token", async () => {
  const payload = {
    userId: "user-123",
    email: "test@example.com",
    expiresAt: new Date().toISOString(),
  };
  const token = await createToken(payload);
  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("../auth");
  const session = await getSession();

  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-123");
  expect(session!.email).toBe("test@example.com");
});

test("getSession returns null for an expired token", async () => {
  const payload = {
    userId: "user-123",
    email: "test@example.com",
  };
  const token = await createToken(payload, { expired: true });
  await new Promise((r) => setTimeout(r, 1100));
  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("../auth");
  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for a malformed token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not-a-valid-jwt" });

  const { getSession } = await import("../auth");
  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for a token signed with wrong secret", async () => {
  const wrongSecret = new TextEncoder().encode("wrong-secret");
  const token = await new SignJWT({ userId: "user-123", email: "t@t.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(wrongSecret);

  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("../auth");
  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null when cookie value is empty string", async () => {
  mockCookieStore.get.mockReturnValue({ value: "" });

  const { getSession } = await import("../auth");
  const session = await getSession();

  expect(session).toBeNull();
});
