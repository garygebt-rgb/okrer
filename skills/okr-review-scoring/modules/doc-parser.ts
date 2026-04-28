// Document parser module for okr-review-scoring
// Parses user self-narrative documents (Feishu docs) into structured data

import { Objective, KeyResult, JobCategory } from '../../okr-shared/okr-types';

/** Parsed OKR card from narrative document */
export interface OKRCard {
  /** Objective title */
  objectiveTitle: string;
  /** Key results within this objective */
  keyResults: Array<{
    /** KR description */
    description: string;
    /** User's claimed completion score (0-1) */
    claimedScore: number;
    /** Evidence links mentioned for this KR */
    evidenceLinks: string[];
  }>;
}

/** Parsed narrative document structure */
export interface ParsedNarrativeDoc {
  /** Executive summary extracted from document */
  executiveSummary: string;
  /** OKR cards extracted by LLM analysis */
  okrCards: OKRCard[];
  /** Screenshot URLs or identifiers */
  screenshots: string[];
  /** Appendix links (docs, repos, dashboards, etc.) */
  appendixLinks: string[];
  /** Raw document content */
  rawContent: string;
  /** Quarter identifier (e.g. "2026-Q1") */
  quarter: string;
  /** User ID extracted from document or context */
  userId: string;
}

/**
 * Fetch and parse a Feishu narrative document.
 *
 * @param docUrl Feishu document URL
 * @returns ParsedNarrativeDoc with extracted sections
 */
export async function fetchAndParseDoc(docUrl: string): Promise<ParsedNarrativeDoc> {
  // In Claude Code Skills, fetching and parsing happens in the workflow step
  // via lark-cli docs +fetch. This function serves as a type-safe interface.
  //
  // The workflow step (step1-material-collect.md) should:
  // 1. Run: lark-cli docs +fetch "<docUrl>"
  // 2. Use LLM semantic understanding to extract structured sections
  // 3. Return ParsedNarrativeDoc

  if (!docUrl) {
    throw new Error('Document URL is required');
  }

  return {
    executiveSummary: '',
    okrCards: [],
    screenshots: [],
    appendixLinks: [],
    rawContent: '',
    quarter: '',
    userId: '',
  };
}

/**
 * Extract OKR cards from raw document content using LLM semantic understanding.
 *
 * @param rawContent Raw document text
 * @returns Array of extracted OKRCard objects
 */
export function extractOKRCards(rawContent: string): OKRCard[] {
  // In Claude Code Skills, this extraction is done by LLM in the workflow step.
  // No rigid parsing rules — rely on LLM's ability to identify sections by context.
  // This function is a type-safe placeholder for the workflow to reference.
  return [];
}

/**
 * Extract evidence links from raw document content.
 * Extracts all URLs and document references.
 *
 * @param rawContent Raw document text
 * @returns Array of URLs found in the content
 */
export function extractEvidenceLinks(rawContent: string): string[] {
  // Simple URL extraction — URLs matching common patterns
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  const matches = rawContent.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}
