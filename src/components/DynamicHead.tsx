import Head from "next/head";

interface HeadProps {
  titleExtra?: string;
  favicon?: "default" | "diff" | "equal";
}

const faviconMap = {
  default: "/shapes.svg",
  diff: "/diff.svg",
  equal: "/check.svg",
};

export const DynamicHead = ({ titleExtra, favicon }: HeadProps) => {
  const title = titleExtra ? `Differ | ${titleExtra}` : "Differ";
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content="A tool for comparing two web pages." />
      <link rel="icon" href={faviconMap[favicon ?? "default"]} />
    </Head>
  );
};
