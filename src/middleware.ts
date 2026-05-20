import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";

/**
 * User roles enum matching the backend
 */
enum UserRole {
  Owner = 1,
  Admin = 2,
  SalesManager = 3,
  SalesUser = 4,
}

/**
 * Decoded JWT token payload
 */
interface DecodedJWT {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  departmentId?: string;
  organizationId: string;
  exp: number;
  iat: number;
}

/**
 * Route permissions configuration
 * Maps routes to required roles (empty array = all authenticated users)
 */
const routePermissions: Record<string, UserRole[]> = {
  "/users": [UserRole.Owner, UserRole.Admin],
  "/settings": [UserRole.Owner],
  "/dashboard": [], // All authenticated users
  "/profile": [], // All authenticated users
};

/**
 * Decode and validate JWT token
 */
function decodeJWT(token: string): DecodedJWT | null {
  try {
    // Decode without verification (verification happens on the backend)
    // In Edge Runtime, we can't verify signatures easily, so we just decode
    const decoded = jwt.decode(token) as DecodedJWT | null;
    
    if (!decoded) {
      return null;
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has required role for a route
 */
function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  // Empty array means all authenticated users can access
  if (requiredRoles.length === 0) {
    return true;
  }
  
  return requiredRoles.includes(userRole);
}

/**
 * Get required roles for a given pathname
 */
function getRequiredRoles(pathname: string): UserRole[] | null {
  // Check exact match first
  if (pathname in routePermissions) {
    return routePermissions[pathname];
  }
  
  // Check if pathname starts with any configured route
  for (const [route, roles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route + "/")) {
      return roles;
    }
  }
  
  // No specific permissions configured, allow all authenticated users
  return [];
}

/**
 * Middleware for authentication and authorization
 * Runs on Edge Runtime for ultra-fast performance
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get("accessToken")?.value;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route));

  // Not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated but trying to access login page
  if (token && pathname === "/login") {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const redirectUrl = callbackUrl || "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Role-based access control for protected routes
  if (token && !isPublicRoute) {
    const decoded = decodeJWT(token);
    
    // Invalid or expired token
    if (!decoded) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      
      // Create response with redirect and clear the invalid token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("accessToken");
      return response;
    }

    // Check role-based permissions
    const requiredRoles = getRequiredRoles(pathname);
    
    if (requiredRoles !== null && !hasRequiredRole(decoded.role, requiredRoles)) {
      // User doesn't have required role, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
