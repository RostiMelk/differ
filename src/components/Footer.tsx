import Link from "next/link";
import { Github } from "lucide-react";
export const Footer = () => (
  <footer className="container py-16 text-center text-sm text-gray-500">
    <p className="flex items-center justify-center gap-1">
      <Github className="h-4 w-4" />
      View source on{" "}
      <Link
        href="https://github.com/rostimelk/differ"
        target="_blank"
        className=" underline"
      >
        GitHub
      </Link>
    </p>
  </footer>
);
