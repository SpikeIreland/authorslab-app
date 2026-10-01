/* ===========================================================================
 * PASTE TARGET
 *   n8n → workflow "1.4 Parse Chapters" (AeoOCHAG1Xu2wNoE)
 *        → node "Prepare Safe Chapter Storage"
 *        → replace the ENTIRE contents of the JavaScript field with this file.
 *
 * Nothing else in the workflow changes. No other node needs touching.
 *
 * WHY (2026-10-01) — two silent content losses, both found the same morning:
 *
 *  1. A detected prologue was stored ONLY if the uploader had ticked a box.
 *     The parser found it, then threw it away. The text survived in
 *     manuscripts.full_text so nothing looked broken, but the section never
 *     reached the chapters table and no editorial pass ever read it — a book
 *     analysed without its opening. Same for the epilogue.
 *     Fix: detection drives storage. The flags are advisory and are logged
 *     when they disagree with what was found.
 *
 *  2. Duplicate chapter numbers were deduplicated by keeping the LONGEST
 *     content and discarding the rest. On "CS The List" the author labels two
 *     chapters 20, two 48 and two 76, and has no 19, 47 or 78 — so three real
 *     chapters, 1,594 words, reached full_text but no chapter row. Invisible,
 *     because the sidebar numbering looked continuous.
 *     (manuscript_id, chapter_number) is UNIQUE, so a collision must move —
 *     but it must not vanish. The EARLIER section in document order is now
 *     reseated into the nearest free slot below its declared number, which is
 *     exactly where the author's skipped number sits. The author's own label
 *     is preserved in the title, so position and label can be compared by a
 *     human rather than silently reconciled by us.
 *
 * Anomalies are returned on the output item as `anomalies[]`, ready for the
 * Structural Sentinel (Gate A) to consume — see
 * docs/ingestion/AL-INGEST-V1-the-sentinel-and-the-thirty-minute-wait.md
 * =========================================================================== */

const manuscriptText = $("Retrieve Manuscript").first().json.full_text;
const manuscriptId = $("Retrieve Manuscript").first().json.id;

// ADVISORY ONLY since 2026-10-01. A tickbox must not delete a chapter.
const hasPrologue =
  $("Webhook").first().json.body?.hasPrologue === "true" ||
  $("Webhook").first().json.body?.hasPrologue === true;
const hasEpilogue =
  $("Webhook").first().json.body?.hasEpilogue === "true" ||
  $("Webhook").first().json.body?.hasEpilogue === true;

console.log(`Uploader hints (advisory) - Prologue: ${hasPrologue}, Epilogue: ${hasEpilogue}`);

if (!manuscriptText || manuscriptText.length < 100) {
  throw new Error("No manuscript text available for chapter extraction");
}

function normalizeContent(content) {
  const lines = content.split("\n").slice(1); // drop the heading line
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    const nextLine = lines[i + 1]?.trim() || "";

    if (!currentLine) {
      processedLines.push("\n\n");
      continue;
    }

    const endsWithPunctuation = /[.!?"]$/.test(currentLine);
    const nextStartsWithCapital = /^[A-Z"]/.test(nextLine);
    const nextIsEmpty = !nextLine;

    if (endsWithPunctuation && (nextStartsWithCapital || nextIsEmpty)) {
      processedLines.push(currentLine + "\n\n");
    } else if (!nextLine) {
      processedLines.push(currentLine);
    } else {
      processedLines.push(currentLine + " ");
    }
  }

  return processedLines
    .join("")
    .replace(/ {2,}/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const hasStandardChapters = /CHAPTER\s+\d+|Chapter\s+\d+/i.test(manuscriptText);
const hasHashtagChapters = /^#\d+(?:\s*[,&\d\s]*)(?::\s*|\s+)/m.test(manuscriptText);

console.log(`Format detection - Standard: ${hasStandardChapters}, Hashtag: ${hasHashtagChapters}`);

let chapterPattern;
if (hasHashtagChapters && !hasStandardChapters) {
  chapterPattern =
    /(?=(?:^#\d+(?:\s*[,&\d\s]*)(?::\s*|\s+)|^PROLOGUE|^Prologue|^EPILOGUE|^Epilogue|^Introduction\s*$))/im;
} else {
  chapterPattern =
    /(?=(?:PROLOGUE|Prologue|CHAPTER\s+\d+|Chapter\s+\d+|EPILOGUE|Epilogue))/i;
}

// rawSplits preserves DOCUMENT ORDER, which is the only trustworthy signal
// about sequence when the author's own numbering disagrees with itself.
const rawSplits = manuscriptText
  .split(chapterPattern)
  .filter((section) => section.trim().length > 100);

console.log(`Raw splits found: ${rawSplits.length} sections`);

const identifiedSections = rawSplits.map((section) => {
  const firstLine = section.trim().substring(0, 200).split("\n")[0];

  if (/^PROLOGUE|^Prologue/i.test(firstLine)) {
    return { type: "prologue", content: section.trim() };
  } else if (/^EPILOGUE|^Epilogue/i.test(firstLine)) {
    return { type: "epilogue", content: section.trim() };
  } else if (/^Introduction\s*$/i.test(firstLine)) {
    return { type: "introduction", content: section.trim() };
  } else if (/^CHAPTER\s+(\d+)|^Chapter\s+(\d+)/i.test(firstLine)) {
    const match = firstLine.match(/CHAPTER\s+(\d+)|Chapter\s+(\d+)/i);
    return { type: "chapter", number: parseInt(match[1] || match[2]), content: section.trim() };
  } else if (/^#(\d+)/.test(firstLine)) {
    return { type: "chapter", number: parseInt(firstLine.match(/^#(\d+)/)[1]), content: section.trim() };
  }
  return { type: "unknown", content: section.trim() };
});

console.log(
  "Identified sections:",
  identifiedSections.map((s) => `${s.type}${s.number ? " " + s.number : ""}`).join(", "),
);

const extractTitle = (content, chapterNumber, isHashtagFormat) => {
  const firstLine = content.split("\n")[0].trim();

  if (isHashtagFormat) {
    const hashtagTitle = firstLine.match(/^#\d+(?:\s*[,&\d\s]*)(?::\s*|\s+)(.+)$/i);
    if (hashtagTitle) return hashtagTitle[1].trim();
  }

  const titleWithHyphen = firstLine.match(/Chapter\s+\d+\s*-\s*(.+)$/i);
  if (titleWithHyphen) return titleWithHyphen[1].trim();

  const titleWithoutHyphen = firstLine.match(/Chapter\s+\d+\s+(.+)$/i);
  if (titleWithoutHyphen) return titleWithoutHyphen[1].trim();

  return `Chapter ${chapterNumber}`;
};

const finalChapters = [];
const isHashtagFormat = hasHashtagChapters && !hasStandardChapters;
const anomalies = [];

const prologueSection = identifiedSections.find((s) => s.type === "prologue");
const introSection = identifiedSections.find((s) => s.type === "introduction");
const epilogueSection = identifiedSections.find((s) => s.type === "epilogue");

// (manuscript_id, chapter_number) is UNIQUE, so every number is a scarce slot.
const used = new Set();

// --- Chapter 0 --------------------------------------------------------------
// A found prologue always wins; Introduction fills the slot only when there is
// no prologue, so the two can never collide.
if (prologueSection) {
  finalChapters.push({ number: 0, title: "Prologue", content: normalizeContent(prologueSection.content) });
  used.add(0);
  if (!hasPrologue) {
    anomalies.push("prologue_found_but_not_flagged");
    console.log("NOTE: prologue found though not flagged by the uploader. Stored - detection drives storage.");
  }
} else if (introSection) {
  finalChapters.push({ number: 0, title: "Introduction", content: normalizeContent(introSection.content) });
  used.add(0);
} else if (hasPrologue) {
  anomalies.push("prologue_flagged_but_not_found");
  console.log("NOTE: uploader flagged a prologue but none was detected. Nothing stored at chapter 0.");
}

if (epilogueSection) used.add(999); // reserve before chapters are seated

// --- Numbered chapters: nothing is ever discarded ---------------------------
const chapterSections = identifiedSections.filter((s) => s.type === "chapter");

const declaredCounts = new Map();
chapterSections.forEach((s) => declaredCounts.set(s.number, (declaredCounts.get(s.number) || 0) + 1));

const seenSoFar = new Map();

chapterSections.forEach((section) => {
  const declared = section.number;
  const total = declaredCounts.get(declared);
  const occurrence = (seenSoFar.get(declared) || 0) + 1;
  seenSoFar.set(declared, occurrence);

  let assigned = declared;
  const isDuplicate = total > 1;
  const isLastOccurrence = occurrence === total;

  // The LAST occurrence keeps the declared number; earlier ones move down into
  // the gap the author left. For 18, 20, 20, 21 this yields 18, 19, 20, 21 —
  // preserving document order rather than inverting it.
  if ((isDuplicate && !isLastOccurrence) || used.has(assigned)) {
    let candidate = null;
    for (let i = declared - 1; i >= 1; i--) {
      if (!used.has(i)) { candidate = i; break; }
    }
    if (candidate === null) {
      for (let i = declared + 1; i < 999; i++) {
        if (!used.has(i)) { candidate = i; break; }
      }
    }
    if (candidate !== null) {
      assigned = candidate;
      anomalies.push(`chapter_label_${declared}_reseated_as_${assigned}`);
      console.log(`COLLISION: a section labelled "Chapter ${declared}" reseated as ${assigned} (kept, not discarded).`);
    } else {
      anomalies.push(`chapter_label_${declared}_no_free_slot`);
      console.log(`COLLISION: no free slot for a second "Chapter ${declared}". Skipped - RAISE THIS.`);
      return;
    }
  }

  used.add(assigned);
  finalChapters.push({
    number: assigned,
    // Title carries the AUTHOR'S label, not our assigned position.
    title: extractTitle(section.content, declared, isHashtagFormat),
    content: normalizeContent(section.content),
  });
});

console.log(`Seated ${chapterSections.length} chapter sections with no discards`);

// --- Chapter 999 ------------------------------------------------------------
if (epilogueSection) {
  finalChapters.push({ number: 999, title: "Epilogue", content: normalizeContent(epilogueSection.content) });
  if (!hasEpilogue) {
    anomalies.push("epilogue_found_but_not_flagged");
    console.log("NOTE: epilogue found though not flagged by the uploader. Stored - detection drives storage.");
  }
} else if (hasEpilogue) {
  anomalies.push("epilogue_flagged_but_not_found");
  console.log("NOTE: uploader flagged an epilogue but none was detected. Nothing stored at chapter 999.");
}

finalChapters.sort((a, b) => a.number - b.number);

const sanitizedChapters = finalChapters.map((ch) => ({
  number: ch.number,
  title: ch.title.replace(/'/g, "''").substring(0, 255),
  content: ch.content,
}));

console.log(`Final: ${sanitizedChapters.length} chapters prepared. Anomalies: ${anomalies.length ? anomalies.join(", ") : "none"}`);

return {
  json: {
    manuscriptId: manuscriptId,
    chapters: sanitizedChapters,
    totalChapters: sanitizedChapters.length,
    sectionsDetected: identifiedSections.length,
    sectionsSeated: sanitizedChapters.length,
    anomalies: anomalies,
    format: isHashtagFormat ? "hashtag" : "standard",
  },
};
