import type { BodyBlock } from "@/lib/news";

/** True when the body has no level 2 heading, so level 3 headings must render as h2. */
export function needsHeadingPromotion(blocks: BodyBlock[]): boolean {
  return !blocks.some((block) => block.type === "heading" && block.level === 2);
}

function Block({ block, promote }: { block: BodyBlock; promote: boolean }) {
  switch (block.type) {
    case "heading": {
      const Heading = block.level === 2 || promote ? "h2" : "h3";
      return block.level === 2 ? (
        <Heading className="mt-6 text-h3">{block.text}</Heading>
      ) : (
        <Heading className="mt-4 font-semibold text-lg text-ink">
          {block.text}
        </Heading>
      );
    }
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`flex flex-col gap-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}
        >
          {block.items.map((item) => (
            <li key={`${item.title ?? ""}${item.text}`}>
              {item.title ? (
                <strong className="font-semibold text-ink">
                  {item.title}
                  {item.text ? ": " : ""}
                </strong>
              ) : null}
              {item.text}
            </li>
          ))}
        </List>
      );
    }
    case "quote":
      return (
        <figure className="border-brand border-l-4 py-1 pl-6">
          <blockquote className="text-lead text-ink">{block.text}</blockquote>
          {block.attribution ? (
            <figcaption className="mt-2 text-muted text-sm">
              {block.attribution}
            </figcaption>
          ) : null}
        </figure>
      );
    default:
      return <p>{block.text}</p>;
  }
}

type ArticleBodyProps = {
  blocks: BodyBlock[];
  promoteHeadings: boolean;
};

export function ArticleBody({ blocks, promoteHeadings }: ArticleBodyProps) {
  return (
    <div lang="de" className="flex flex-col gap-5 text-lg leading-relaxed">
      {blocks.map((block, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: blocks are static and never reorder
        <Block key={index} block={block} promote={promoteHeadings} />
      ))}
    </div>
  );
}
