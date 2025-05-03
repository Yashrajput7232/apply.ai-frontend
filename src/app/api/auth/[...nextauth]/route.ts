
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { User, Account, Profile } from "next-auth";

const EXTERNAL_API_URL = "https://flask-google-oauth.onrender.com/login/google"; // Your external backend URL

async function handleExternalAuth(token: JWT, user?: User, account?: Account | null): Promise<JWT> {
  if (account && user && account.provider === 'google') {
    try {
      console.log("Attempting to authenticate with external API...");
      const response = await fetch(EXTERNAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Send the ID token obtained from Google via NextAuth
          'Authorization': `Bearer ${account.id_token}`,
        },
        body: JSON.stringify({
          // You might not need to send email/name if your backend can derive it from the id_token
          // email: user.email,
          // name: user.name,
        }),
      });

      console.log(`External API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("External API authentication failed:", response.status, errorData);
        throw new Error(`External API auth failed: ${response.statusText}`);
      }

      const externalData = await response.json();
      console.log("External API authentication successful:", externalData);

      // Store necessary info from your backend response in the JWT token
      // Adjust based on what your backend returns (e.g., userId, custom roles)
      token.externalApiToken = externalData.access_token; // Example: Store a token from your backend
      token.externalUserId = externalData.user_id; // Example: Store user ID from your backend
      token.isRegistered = true; // Mark user as registered in your system

    } catch (error) {
      console.error("Error during external API authentication:", error);
      // Handle error: You might want to prevent login or store an error state in the token
      token.error = "ExternalAuthError";
      // Optionally prevent the session from being established by throwing or returning a modified token
      // throw new Error("Failed to authenticate with external service");
    }
  }
  return token;
}


const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Request 'openid' scope for ID token
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT strategy to handle custom data
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
        // Initial sign in - pass user and account to external handler
        if (account && user) {
           token = await handleExternalAuth(token, user, account);
        }

        // Merge external data into the standard token fields if needed for client access
        // Be careful about exposing sensitive data
        if (token.externalUserId) {
            token.sub = token.externalUserId as string; // Use external ID as subject if desired
        }

        return token;
    },
    async session({ session, token }) {
        // Pass data from JWT token to the session object for client-side use
        if (session.user) {
            // Add custom fields from the JWT token to the session user object
            // Make sure to update the Session type definition if you add fields
            (session.user as any).id = token.externalUserId; // Add external user ID
        }
        // Add other fields from token if needed
        (session as any).externalApiToken = token.externalApiToken;
        (session as any).error = token.error; // Pass potential auth errors
        (session as any).isRegistered = token.isRegistered;


        return session;
    }
  },
  // Optional: Add a sign-in callback to prevent login if external auth failed
  // async signIn({ user, account, profile, email, credentials }) {
  //   // If using JWT, this check might be better placed within the jwt callback
  //   // by checking for token.error after handleExternalAuth runs.
  //   // However, this callback runs earlier.
  //
  //   // Temporary token structure for check (actual handling is in jwt callback)
  //   let tempToken: JWT = { sub: user.id };
  //   tempToken = await handleExternalAuth(tempToken, user, account);
  //
  //   if (tempToken.error === "ExternalAuthError") {
  //     console.log("Preventing sign-in due to external auth error.");
  //     return false; // Prevent sign-in
  //   }
  //   return true; // Allow sign-in
  // },
  pages: {
    signIn: '/', // Redirect to landing page for sign-in
    error: '/auth/error', // Optional: Custom error page
  },
  // Add secret for production
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

// Extend the built-in session/user/token types if you add custom fields
declare module "next-auth" {
  interface Session {
    externalApiToken?: string;
    isRegistered?: boolean;
    error?: string;
    user?: {
      id?: string; // Add your external user ID here
    } & DefaultSession["user"];
  }

   interface User {
        // You can add fields here if needed during the initial user creation phase
        // but usually, custom data is added via JWT/Session callbacks.
   }
}

declare module "next-auth/jwt" {
  interface JWT {
    externalApiToken?: string;
    externalUserId?: string | number; // Or whatever type your ID is
    isRegistered?: boolean;
    error?: string;
  }
}
