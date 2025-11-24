import { NextRequest } from "next/server";
import {
  authorizeRequest,
  hasWritePermission,
  canIncludeEmails,
} from "../auth";

describe("papers auth helpers", () => {
  const originalToken = process.env.API_AUTH_TOKEN;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    if (originalToken) {
      process.env.API_AUTH_TOKEN = originalToken;
    } else {
      delete process.env.API_AUTH_TOKEN;
    }
  });

  const makeRequest = (headers?: Record<string, string>) =>
    new NextRequest("http://localhost/api/papers", {
      headers: new Headers(headers),
    });

  it("rejects when API_AUTH_TOKEN is not configured", () => {
    delete process.env.API_AUTH_TOKEN;
    const result = authorizeRequest(makeRequest());
    expect(result.authorized).toBe(false);
    expect(result.message).toMatch(/Server configuration error/i);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "API_AUTH_TOKEN is not configured. Requests are denied.",
    );
  });

  it("rejects when bearer token does not match", () => {
    process.env.API_AUTH_TOKEN = "expected-token";
    const result = authorizeRequest(
      makeRequest({ authorization: "Bearer wrong", "x-user-role": "admin" }),
    );
    expect(result.authorized).toBe(false);
    expect(result.message).toMatch(/Invalid credentials/i);
  });

  it("authorizes valid token and surfaces role header", () => {
    process.env.API_AUTH_TOKEN = "expected-token";
    const result = authorizeRequest(
      makeRequest({
        authorization: "Bearer expected-token",
        "x-user-role": "Principal_Investigator",
      }),
    );
    expect(result.authorized).toBe(true);
    expect(result.role).toBe("principal_investigator");
  });

  it("defaults to viewer role when header is missing", () => {
    process.env.API_AUTH_TOKEN = "expected-token";
    const result = authorizeRequest(
      makeRequest({
        authorization: "Bearer expected-token",
      }),
    );
    expect(result.role).toBe("viewer");
  });

  it("evaluates write and email permissions correctly", () => {
    expect(hasWritePermission("admin")).toBe(true);
    expect(hasWritePermission("principal_investigator")).toBe(true);
    expect(hasWritePermission("viewer")).toBe(false);
    expect(hasWritePermission("")).toBe(false);
    expect(canIncludeEmails("admin")).toBe(true);
    expect(canIncludeEmails("principal_investigator")).toBe(true);
    expect(canIncludeEmails("viewer")).toBe(false);
    expect(canIncludeEmails("")).toBe(false);
  });
});
