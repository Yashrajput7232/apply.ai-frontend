
export { default } from "next-auth/middleware";

// Apply middleware protection to the dashboard route
export const config = { matcher: ["/dashboard/:path*"] };

// Default behavior of next-auth/middleware:
// If the user is not authenticated, it redirects them to the sign-in page
// specified in your NextAuth configuration (or the default /api/auth/signin).
// Since we set pages: { signIn: '/' } in the NextAuth config, it will redirect to '/'.
