import { POST } from "../route";
import { NextRequest } from "next/server";

process.env.NODE_ENV = "test";

describe("/api/auth/logout POST handler", () => {
  it("should return a 200 status and clear the auth_token cookie", async () => {
    const request = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload).toEqual({ success: true });

    const cookieHeader = response.headers.get("set-cookie");
    
    expect(cookieHeader).not.toBeNull();

    expect(cookieHeader).toContain("auth_token=;"); // nulled cookie value
    expect(cookieHeader).toContain("HttpOnly"); // HttpOnly attribute
    expect(cookieHeader).toContain("Max-Age=0"); // Max-Age = 0 (instantly expire)
    expect(cookieHeader).toContain("Path=/"); // root path

    expect(cookieHeader).not.toContain("Secure");
  });

  it("should include the Secure flag in production environment", async () => {
    process.env.NODE_ENV = "production";
    
    const request = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
    });

    const response = await POST(request);
    
    const cookieHeader = response.headers.get("set-cookie");
    
    expect(cookieHeader).toContain("Secure");
    
    process.env.NODE_ENV = "test";
  });
});