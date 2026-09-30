import "dotenv/config";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("Authentication & Authorization API Tests", () => {
  let server;
  let baseUrl;
  let testUserAccessToken = "";
  let testUserRefreshTokenCookie = "";

  const testUser = {
    name: "Automated Tester",
    email: "automated_tester@example.com",
    password: "SecurePassword123!",
    phone: "1234567890",
  };

  // Setup: Spin up server on an ephemeral free port and clean up previous test data
  before(async () => {
    // Clean up any lingering test user
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  // Teardown: Close server and delete test user
  after(async () => {
    try {
      await prisma.user.deleteMany({ where: { email: testUser.email } });
    } finally {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    }
  });

  // ==========================================
  // 1. REGISTRATION TESTS
  // ==========================================
  describe("POST /api/auth/register", () => {
    it("should successfully register a new user and set HTTP-only refresh cookie", async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...testUser,
          role: "ADMIN", // Attacker trying to elevate privileges
        }),
      });

      const body = await response.json();

      assert.equal(response.status, 201);
      assert.equal(body.success, true);
      assert.equal(body.message, "User registered successfully");
      assert.ok(body.data.accessToken, "Should return access token in response body");

      // Verify safe user fields returned
      assert.equal(body.data.user.email, testUser.email);
      assert.equal(body.data.user.name, testUser.name);
      assert.equal(body.data.user.role, "CUSTOMER", "Public registration must force role to CUSTOMER");
      assert.equal(body.data.user.password, undefined, "Password must not be returned");
      assert.equal(body.data.user.passwordHash, undefined, "Password hash must not be returned");

      // Verify HTTP-only refresh cookie was sent
      const setCookie = response.headers.get("set-cookie");
      assert.ok(setCookie, "Set-Cookie header must be present");
      assert.ok(setCookie.includes("refreshToken="), "Cookie must contain refreshToken");
      assert.ok(setCookie.toLowerCase().includes("httponly"), "Cookie must be HttpOnly");

      // Store tokens for subsequent tests
      testUserAccessToken = body.data.accessToken;
      testUserRefreshTokenCookie = setCookie.split(";")[0];
    });

    it("should reject registration with duplicate email (409 Conflict)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });

      const body = await response.json();
      assert.equal(response.status, 409);
      assert.equal(body.success, false);
      assert.equal(body.message, "An account with this email already exists");
    });

    it("should reject registration with invalid email format (400 Bad Request)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Invalid User",
          email: "not-an-email",
          password: "ValidPassword123!",
        }),
      });

      const body = await response.json();
      assert.equal(response.status, 400);
      assert.equal(body.success, false);
      assert.ok(
        body.errors.some((err) => err.field === "email"),
        "Validation error must indicate email field issue"
      );
    });

    it("should reject registration with short password (400 Bad Request)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Short Pass",
          email: "shortpass@example.com",
          password: "123",
        }),
      });

      const body = await response.json();
      assert.equal(response.status, 400);
      assert.equal(body.success, false);
      assert.ok(
        body.errors.some((err) => err.field === "password"),
        "Validation error must indicate password field issue"
      );
    });
  });

  // ==========================================
  // 2. LOGIN TESTS
  // ==========================================
  describe("POST /api/auth/login", () => {
    it("should successfully log in with correct credentials", async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.message, "Login successful");
      assert.ok(body.data.accessToken);
      assert.equal(body.data.user.email, testUser.email);
      assert.equal(body.data.user.password, undefined);
      assert.equal(body.data.user.passwordHash, undefined);

      const setCookie = response.headers.get("set-cookie");
      assert.ok(setCookie.includes("refreshToken="));
    });

    it("should reject login with wrong password (401 Unauthorized)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: "WrongPassword999!",
        }),
      });

      const body = await response.json();
      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.equal(body.message, "Invalid email or password");
    });

    it("should reject login with non-existent email (401 Unauthorized)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent_email@example.com",
          password: "AnyPassword123!",
        }),
      });

      const body = await response.json();
      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.equal(body.message, "Invalid email or password");
    });
  });

  // ==========================================
  // 3. CURRENT USER (/me) TESTS
  // ==========================================
  describe("GET /api/auth/me", () => {
    it("should return authenticated user profile when Bearer token is provided", async () => {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${testUserAccessToken}`,
        },
      });

      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.user.email, testUser.email);
      assert.equal(body.data.user.role, "CUSTOMER");
      assert.equal(body.data.user.passwordHash, undefined);
    });

    it("should reject request when Authorization header is missing (401 Unauthorized)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/me`);
      const body = await response.json();

      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.ok(body.message.includes("Authentication required"));
    });

    it("should reject request when invalid token is provided (401 Unauthorized)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          Authorization: "Bearer invalid.malformed.token",
        },
      });

      const body = await response.json();
      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.equal(body.message, "Invalid access token");
    });
  });

  // ==========================================
  // 4. REFRESH TOKEN TESTS
  // ==========================================
  describe("POST /api/auth/refresh", () => {
    it("should issue a new access token when valid refresh cookie is sent", async () => {
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: testUserRefreshTokenCookie,
        },
      });

      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.data.accessToken);
    });

    it("should reject refresh when refresh cookie is missing (401 Unauthorized)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
      });

      const body = await response.json();
      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.equal(body.message, "Refresh token is missing");
    });

    it("should reject refresh when refresh token is invalid or corrupted (401 Unauthorized)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: "refreshToken=invalid.token.signature",
        },
      });

      const body = await response.json();
      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.equal(body.message, "Invalid or expired refresh token");
    });

    it("should reject refresh if user account is deactivated or deleted (401 Unauthorized)", async () => {
      // Deactivate user temporarily
      await prisma.user.update({
        where: { email: testUser.email },
        data: { isActive: false },
      });

      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: testUserRefreshTokenCookie,
        },
      });

      const body = await response.json();
      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.equal(body.message, "User not found or account deactivated");

      // Restore user active state
      await prisma.user.update({
        where: { email: testUser.email },
        data: { isActive: true },
      });
    });
  });

  // ==========================================
  // 5. ADMIN AUTHORIZATION (requireAdmin) TESTS
  // ==========================================
  describe("GET /api/auth/admin-check (requireAdmin middleware)", () => {
    it("should forbid CUSTOMER users from accessing admin routes (403 Forbidden)", async () => {
      const response = await fetch(`${baseUrl}/api/auth/admin-check`, {
        headers: {
          Authorization: `Bearer ${testUserAccessToken}`,
        },
      });

      const body = await response.json();
      assert.equal(response.status, 403);
      assert.equal(body.success, false);
      assert.ok(body.message.includes("Admin privileges required"));
    });
  });

  // ==========================================
  // 6. LOGOUT TESTS
  // ==========================================
  describe("POST /api/auth/logout", () => {
    it("should clear the refresh token cookie", async () => {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
      });

      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.message, "Logout successful");

      const setCookie = response.headers.get("set-cookie");
      assert.ok(setCookie);
      assert.ok(
        setCookie.includes("refreshToken=;") ||
          setCookie.toLowerCase().includes("expires=") ||
          setCookie.toLowerCase().includes("max-age=0"),
        "Cookie must be invalidated or expired"
      );
    });
  });
});
