import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Snapshot = () => {
  const router = useRouter();
  const id = useMemo(() => router.asPath.replace("/", ""), [router]);

  return (
    <>
      <Head>
        <title>Differ 404</title>
      </Head>

      <header className=" container my-12">
        <h1 className="mb-4 text-4xl font-medium">
          Could not load Differ snapshot for ID
        </h1>
        <p className="text-sm font-light">{id}</p>
      </header>

      <main className="container">
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back to app
          </Button>
        </Link>{" "}
      </main>

      <Footer />
    </>
  );
};

export default Snapshot;
