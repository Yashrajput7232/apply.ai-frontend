
import Link from 'next/link';
import { Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-6 mt-auto border-t bg-background">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
          Created by Yash Rajput
        </p>
        <div className="flex space-x-4">
          <Link
            href="https://www.linkedin.com/in/yashrajput7232"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yash Rajput's LinkedIn Profile"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
          <Link
            href="https://github.com/yash7232"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yash Rajput's GitHub Profile"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
