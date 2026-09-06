import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function rewriteHref(href?: string) {
  if (!href) {
    return href;
  }

  const phase = href.match(/(\d{2}-[a-z0-9-]+)\/README\.md/);
  if (phase) {
    return `/roadmap/${phase[1]}`;
  }

  if (href.endsWith("ROADMAP.md")) {
    return "/roadmap";
  }

  return href;
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const next = rewriteHref(href);

            if (next?.startsWith("/")) {
              return <Link href={next}>{children}</Link>;
            }

            if (next?.startsWith("http")) {
              return (
                <a href={next} target="_blank" rel="noreferrer">
                  {children}
                </a>
              );
            }

            return <span>{children}</span>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
