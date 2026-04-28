// Screenshot parser module for okr-review-scoring
// Provides type definitions for screenshot analysis via Claude vision

/** Screenshot analysis result */
export interface ScreenshotAnalysis {
  /** Image URL or identifier */
  imageUrl: string;
  /** What the screenshot shows */
  description: string;
  /** Actionable data extracted (metrics, counts, etc.) */
  extractedData: string;
  /** Type of evidence shown in screenshot */
  evidenceType: 'dashboard' | 'code' | 'document' | 'chat' | 'other';
  /** Confidence in the extraction (0-1) */
  confidence: number;
  /** Whether the extracted data can be used as evidence */
  usable: boolean;
  /** Reason if not usable */
  unusableReason?: string;
}

/**
 * Parse a single screenshot and extract evidence data.
 *
 * Implementation note: This module provides type definitions for use in
 * workflow markdown files. The actual screenshot parsing is performed by
 * Claude's vision capabilities in step5-doc-parse.md workflow.
 *
 * @param imageUrl URL or path to the screenshot image
 * @returns ScreenshotAnalysis with extracted evidence data
 */
export async function parseScreenshot(imageUrl: string): Promise<ScreenshotAnalysis> {
  // In Claude Code Skills, the actual parsing happens in the workflow step
  // via Claude vision API. This function serves as a type-safe interface.
  // The workflow step should:
  // 1. Load the image (via URL or base64 from lark-cli docs +fetch)
  // 2. Call Claude vision to analyze
  // 3. Return structured ScreenshotAnalysis

  if (!imageUrl) {
    return {
      imageUrl: '',
      description: '',
      extractedData: '',
      evidenceType: 'other',
      confidence: 0,
      usable: false,
      unusableReason: 'No image URL provided',
    };
  }

  // Placeholder — actual implementation in workflow step
  return {
    imageUrl,
    description: 'Screenshot analysis performed by Claude vision in workflow',
    extractedData: '',
    evidenceType: 'other',
    confidence: 0,
    usable: false,
    unusableReason: 'Vision analysis pending — run in step5-doc-parse.md workflow',
  };
}

/**
 * Parse multiple screenshots in batch.
 *
 * @param imageUrls Array of image URLs to analyze
 * @returns Array of ScreenshotAnalysis results
 */
export async function parseMultipleScreenshots(
  imageUrls: string[]
): Promise<ScreenshotAnalysis[]> {
  const results: ScreenshotAnalysis[] = [];

  for (const url of imageUrls) {
    const analysis = await parseScreenshot(url);
    results.push(analysis);
  }

  return results;
}
