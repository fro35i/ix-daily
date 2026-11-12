import { type HTMLElement, parse } from "node-html-parser";
import type { BodyBlock } from "../src/lib/news/schema";

export type ExtractedPage = {
  lead: string | null;
  authors: string[];
  body: BodyBlock[];
};

type ListItem = Extract<BodyBlock, { type: "list" }>["items"][number];

const STOP_SECTIONS = new Set([
  "contact",
  "teaser-medium-tile",
  "teaser-medium-tile-related",
  "teaser-small-medium-automated",
]);

// Some editors set whole intro paragraphs as headings.
const MAX_HEADING_LENGTH = 150;

const MAX_SUBHEADING_LENGTH = 120;

const SKIPPED_CLASSES = [
  "social-links",
  "button",
  "headline-content-superline",
];

const SHARE_LABELS = new Set([
  "Teilen",
  "Share",
  "Link kopiert",
  "Link copied",
]);

// "Autorin: A, Rolle", "Autor*innen: A & B", or "Autor A B" without a colon.
const AUTHOR_LINE =
  /^Autor(?:in|en|innen|\*innen|:innen)?(?:\s*:\s*|\s+(?=\p{Lu}\S*\s+\p{Lu}))/u;

const MAX_AUTHOR_LINE_LENGTH = 200;

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function decodeText(html: string): string {
  return cleanText(parse(html).text);
}

function textOf(el: HTMLElement | null | undefined): string {
  if (!el) return "";
  for (const br of el.querySelectorAll("br")) br.replaceWith(" ");
  return cleanText(el.text);
}

function sectionType(section: HTMLElement): string {
  const match = section.classList.value.find(
    (name) => name.startsWith("section--") && name !== "section--block",
  );
  return match ? match.slice("section--".length) : "";
}

function isAuthorLine(text: string): boolean {
  return text.length <= MAX_AUTHOR_LINE_LENGTH && AUTHOR_LINE.test(text);
}

/**
 * Splits an author line into names. After a singular label ("Autor",
 * "Autorin") a comma starts the job title, so only "&" and "und" join names.
 */
function parseAuthors(line: string): string[] {
  const label = line.match(AUTHOR_LINE)?.[0] ?? "";
  const rest = cleanText(line.slice(label.length));
  const singular = /^Autor(?:in)?(?:\s|:(?!innen)|$)/u.test(label);
  const names = singular ? rest.split(",")[0] : rest;
  return names
    .split(/\s*(?:,|&|\bund\b|\/)\s*/)
    .map(cleanText)
    .filter(looksLikeName);
}

function looksLikeName(value: string): boolean {
  const words = value.split(" ");
  return (
    words.length >= 2 &&
    words.length <= 5 &&
    /^\p{Lu}/u.test(words[0]) &&
    /^\p{Lu}/u.test(words[words.length - 1])
  );
}

/** Walks rich text and emits paragraphs, headings, lists and quotes. */
function walkRichText(root: HTMLElement, out: BodyBlock[]): void {
  for (const node of root.childNodes) {
    if (node.nodeType !== 1) {
      const loose = cleanText(node.text);
      if (loose.length > 1) out.push({ type: "paragraph", text: loose });
      continue;
    }
    const el = node as HTMLElement;
    const tag = el.rawTagName?.toLowerCase();
    if (SKIPPED_CLASSES.some((name) => el.classList.contains(name))) continue;
    switch (tag) {
      case "h1":
        break;
      case "h2":
      case "h3":
      case "h4":
      case "h5": {
        const text = textOf(el);
        if (text.length > MAX_HEADING_LENGTH) {
          out.push({ type: "paragraph", text });
        } else if (text) {
          out.push({ type: "heading", level: tag === "h2" ? 2 : 3, text });
        }
        break;
      }
      case "p": {
        const text = textOf(el);
        if (!text) break;
        out.push(
          isBoldOnly(el, text)
            ? { type: "heading", level: 3, text }
            : { type: "paragraph", text },
        );
        break;
      }
      case "ul":
      case "ol": {
        const items = el.children
          .filter((child) => child.rawTagName?.toLowerCase() === "li")
          .map((li) => ({ text: textOf(li) }))
          .filter((item) => item.text);
        if (items.length > 0)
          out.push({ type: "list", ordered: tag === "ol", items });
        break;
      }
      case "blockquote": {
        const text = textOf(el);
        if (text) out.push({ type: "quote", text });
        break;
      }
      case "script":
      case "style":
      case "svg":
      case "picture":
      case "img":
      case "iframe":
      case "figure":
      case "button":
      case "form":
      case "hr":
        break;
      default:
        if (el.classList.contains("quote-author")) {
          attachAttribution(out, textOf(el));
        } else {
          walkRichText(el, out);
        }
    }
  }
}

/** A short paragraph that is one bold run works as a subheading. */
function isBoldOnly(p: HTMLElement, text: string): boolean {
  const [only, ...rest] = p.children.filter((child) => child.tagName !== "BR");
  return (
    only !== undefined &&
    rest.length === 0 &&
    ["STRONG", "B"].includes(only.tagName) &&
    textOf(only) === text &&
    text.length <= MAX_SUBHEADING_LENGTH
  );
}

function attachAttribution(out: BodyBlock[], attribution: string): void {
  const last = out.at(-1);
  if (last?.type === "quote" && attribution) last.attribution = attribution;
}

function listBlock(items: ListItem[], ordered: boolean): BodyBlock[] {
  const filled = items.filter((item) => item.text || item.title);
  return filled.length > 0 ? [{ type: "list", ordered, items: filled }] : [];
}

function item(title: string, text: string): ListItem {
  return title ? { title, text } : { text };
}

function extractSection(type: string, section: HTMLElement): BodyBlock[] {
  const out: BodyBlock[] = [];
  switch (type) {
    case "headline-content":
      if (section.querySelector("h1")) return [];
      walkRichText(section, out);
      return out;
    case "paragraph-center":
    case "paragraph-half-half":
    case "paragraph-case":
    case "text-image-grid":
      walkRichText(section, out);
      return out;
    case "headline": {
      const text = textOf(section.querySelector(".headline--title"));
      return text ? [{ type: "heading", level: 2, text }] : [];
    }
    case "paragraph-text-highlight": {
      const text = textOf(section.querySelector(".text-highlight"));
      return text ? [{ type: "quote", text }] : [];
    }
    case "quote-new": {
      const text = textOf(section.querySelector("blockquote"));
      if (!text) return [];
      const attribution = [
        textOf(section.querySelector(".quote-author")),
        textOf(section.querySelector(".quote-author-additional")),
      ]
        .filter(Boolean)
        .join(", ");
      return [
        attribution
          ? { type: "quote", text, attribution }
          : { type: "quote", text },
      ];
    }
    case "paragraph-list": {
      const ordered = section.querySelector("ol") !== null;
      const items = section
        .querySelectorAll(".paragraph-list__item")
        .map((li) =>
          item(
            textOf(li.querySelector(".headline")),
            textOf(li.querySelector(".subline")),
          ),
        );
      return listBlock(items, ordered);
    }
    case "list-static":
    case "accordeon": {
      const prefix = type === "list-static" ? "static-list" : "accordeon";
      const contentSelector =
        type === "list-static"
          ? ".static-list-subline"
          : ".accordeon-subline, .accordeon-body-right";
      for (const entry of section.querySelectorAll(`.${prefix}-item`)) {
        const headline = textOf(entry.querySelector(`.${prefix}-headline`));
        if (headline) out.push({ type: "heading", level: 3, text: headline });
        for (const content of entry.querySelectorAll(contentSelector)) {
          walkRichText(content, out);
        }
      }
      return out;
    }
    case "statistic-tables": {
      const items = section
        .querySelectorAll(".table-item")
        .map((cell) =>
          item(
            textOf(cell.querySelector(".table-item__headline")),
            textOf(cell.querySelector(".table-item__text")),
          ),
        );
      out.push(...listBlock(items, false));
      const source = textOf(section.querySelector(".block-item__source"));
      if (source) out.push({ type: "paragraph", text: source });
      return out;
    }
    case "statistic-loading-lines": {
      const items = section
        .querySelectorAll(".loading-line-item")
        .map((line) =>
          item(
            textOf(line.querySelector(".progress__num")),
            textOf(line.querySelector(".progress__label")),
          ),
        );
      return listBlock(items, false);
    }
    default:
      return [];
  }
}

/** Drops headings that end the body or sit right before a higher-level heading. */
function dropEmptyHeadings(blocks: BodyBlock[]): BodyBlock[] {
  const out: BodyBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "heading") {
      const next = blocks[i + 1];
      if (!next || (next.type === "heading" && next.level < block.level))
        continue;
    }
    out.push(block);
  }
  return out.length === blocks.length ? out : dropEmptyHeadings(out);
}

function firstText(root: HTMLElement, selectors: string[]): string | null {
  for (const selector of selectors) {
    for (const el of root.querySelectorAll(selector)) {
      const text = textOf(el);
      if (text && !isAuthorLine(text)) return text;
    }
  }
  return null;
}

function findAuthors(root: HTMLElement): string[] {
  for (const p of root.querySelectorAll("p")) {
    const line = textOf(p);
    if (isAuthorLine(line)) return parseAuthors(line);
  }
  return [];
}

export function extractPage(html: string): ExtractedPage {
  const root = parse(html);
  const main = root.querySelector("main") ?? root;

  const lead = firstText(main, [
    ".section--subline .subline-content--copy",
    ".section--subline p",
    "h1 + .headline-content-subline",
    ".stage__text .paragraph-large",
  ]);
  const authors = findAuthors(main);

  const blocks: BodyBlock[] = [];
  for (const section of main.querySelectorAll("section.section--block")) {
    const type = sectionType(section);
    if (STOP_SECTIONS.has(type)) break;
    for (const block of extractSection(type, section)) {
      if (
        block.type === "paragraph" &&
        (isAuthorLine(block.text) ||
          block.text === lead ||
          SHARE_LABELS.has(block.text))
      ) {
        continue;
      }
      blocks.push(block);
    }

    // The share widget closes the article text.
    if (section.querySelector(".social-links")) break;
  }

  return { lead, authors, body: dropEmptyHeadings(blocks) };
}
