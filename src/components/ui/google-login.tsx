
'use client';

import { buttonVariants, type ButtonProps } from "@/components/ui/button"; // Import variants and props type
import { cn } from "@/lib/utils"; // Import cn utility

// Define props interface extending ButtonProps to accept size
interface LoginWithGoogleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  size?: ButtonProps['size'];
  className?: string;
}


export default function LoginWithGoogle({ size = 'default', className, ...props }: LoginWithGoogleProps) {
  const handleLogin = () => {
    window.location.href = "https://flask-google-oauth.onrender.com/login/google";
  };

  return (
    <button
      onClick={handleLogin}
      // Apply buttonVariants for size and combine with other classes
      className={cn(
        buttonVariants({ variant: 'outline', size }), // Use outline variant for visual similarity if desired, or default
        "flex items-center gap-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium shadow-md transition-all", // Keep existing styles or adjust as needed
        className // Allow overriding via prop
      )}
      {...props} // Spread remaining props
    >
      {/* Google Logo SVG */}
      <svg width="24" height="24" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" className="shrink-0"> {/* Prevent SVG from shrinking */}
        <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.4c-6.3 34-25 62.9-53.3 82.3v68h86.4c50.6-46.6 81-115.3 81-195.1z" />
        <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24 178.1-64.9l-86.4-68c-24.3 16.3-55.4 25.8-91.7 25.8-70.5 0-130.2-47.6-151.6-111.3H32.6v69.8c44.6 87.6 135.8 149.6 239.4 149.6z" />
        <path fill="#FBBC05" d="M120.4 325.9c-10.2-30.3-10.2-62.9 0-93.2V162.9H32.6c-35.4 70.9-35.4 154.6 0 225.4l87.8-62.4z" />
        <path fill="#EA4335" d="M272 107.7c39.5-.6 77.4 13.4 106.4 39.7l79.4-79.4C412.4 23.3 343.5-.2 272 0 168.4 0 77.2 62 32.6 149.6l87.8 63.1C141.8 155.3 201.5 107.7 272 107.7z" />
      </svg>

      <span className="whitespace-nowrap">Login with Google</span> {/* Prevent text wrapping */}
    </button>
  );
}
