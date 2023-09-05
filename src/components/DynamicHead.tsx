import Head from "next/head";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Favicon = "default" | "diff" | "equal";

interface HeadProps {
  titleExtra?: string;
  favicon?: Favicon;
}

const faviconMap: Record<Favicon, Record<"light" | "dark", string>> = {
  default: {
    light: "/shapes.svg",
    dark: "/shapes-dark.svg",
  },
  diff: {
    light: "/diff.svg",
    dark: "/diff-dark.svg",
  },
  equal: {
    light: "/check.svg",
    dark: "/check-dark.svg",
  },
};

export const DynamicHead = ({ titleExtra, favicon }: HeadProps) => {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const title = titleExtra ? `Differ | ${titleExtra}` : "Differ";
  const faviconKey = favicon ?? "default";
  const faviconSrc = isDarkMode
    ? faviconMap[faviconKey].dark
    : faviconMap[faviconKey].light;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content="A tool for comparing two web pages." />
      <link rel="icon" href={faviconSrc} />
    </Head>
  );
};
