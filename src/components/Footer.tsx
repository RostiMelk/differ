import Link from "next/link";

export const Footer = () => (
  <footer className="container py-16 text-center text-sm text-gray-500">
    <p>
      Made by{" "}
      <Link href="https://rosti.no" className=" underline">
        Rostislav Melkumyan
      </Link>
    </p>
  </footer>
);
