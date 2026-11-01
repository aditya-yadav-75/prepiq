import fs from 'fs';
import path from 'path';
// @ts-ignore
import pdfParse from 'pdf-parse';
// @ts-ignore
import mammoth from 'mammoth';

export interface ExtractionResult {
  text: string;
  character_count: number;
  word_count: number;
  summary: string;
  detected_topics: string[];
  is_valid: boolean;
  error?: string;
}

export class DocumentExtractor {
  /**
   * Minimum character threshold to consider a document viable for exam generation
   */
  public static readonly MIN_CHARS = 100;

  public static async extractFromFile(filePath: string, originalFilename: string): Promise<ExtractionResult> {
    const ext = path.extname(originalFilename).toLowerCase().replace('.', '');
    let text = '';

    try {
      if (ext === 'pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text || '';
      } else if (ext === 'docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value || '';
      } else if (ext === 'txt' || ext === 'md') {
        text = fs.readFileSync(filePath, 'utf-8');
      } else {
        return {
          text: '',
          character_count: 0,
          word_count: 0,
          summary: '',
          detected_topics: [],
          is_valid: false,
          error: `Unsupported file format: .${ext}. Please upload a PDF, DOCX, or TXT file.`
        };
      }

      return this.processExtractedText(text);
    } catch (err: any) {
      return {
        text: '',
        character_count: 0,
        word_count: 0,
        summary: '',
        detected_topics: [],
        is_valid: false,
        error: `Failed to extract text from ${originalFilename}: ${err.message || 'Corrupt or unreadable file.'}`
      };
    }
  }

  public static processExtractedText(rawText: string): ExtractionResult {
    // Normalize whitespace
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    const charCount = cleanedText.length;
    const words = cleanedText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Edge case check: empty or nearly empty document
    if (charCount < this.MIN_CHARS || wordCount < 20) {
      return {
        text: cleanedText,
        character_count: charCount,
        word_count: wordCount,
        summary: '',
        detected_topics: [],
        is_valid: false,
        error: `Document contains insufficient readable content (${charCount} characters, ${wordCount} words). Minimum required is ${this.MIN_CHARS} characters of meaningful text.`
      };
    }

    // Concept & Topic extraction heuristic
    const topics = this.extractTopics(cleanedText);

    // Generate concise summary (first 2-3 substantive sentences)
    const sentences = cleanedText
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 25 && !s.startsWith('#') && !s.startsWith('Chapter') && !s.startsWith('Section'));

    const summary = sentences.slice(0, 3).join(' ') || cleanedText.slice(0, 250) + '...';

    return {
      text: cleanedText,
      character_count: charCount,
      word_count: wordCount,
      summary,
      detected_topics: topics,
      is_valid: true
    };
  }

  private static extractTopics(text: string): string[] {
    const topicSet = new Set<string>();

    // 1. Look for section headings or uppercase lines
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const headingMatch = trimmed.match(/^(?:[0-9]+[\.\)]|chapter\s+[0-9]+|section\s+[0-9]+|part\s+[0-9]+)\s*[:\-\.]?\s*(.+)$/i);
      if (headingMatch && headingMatch[1].length > 3 && headingMatch[1].length < 60) {
        topicSet.add(headingMatch[1].replace(/[:\-]$/, '').trim());
      } else if (trimmed.length > 4 && trimmed.length < 45 && trimmed === trimmed.toUpperCase() && !/[0-9]{4}/.test(trimmed)) {
        topicSet.add(trimmed);
      }
    }

    // 2. Look for capitalized keyword phrases
    if (topicSet.size < 3) {
      const phraseMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g) || [];
      const freq: Record<string, number> = {};
      for (const phrase of phraseMatches) {
        if (phrase.length > 5 && phrase.length < 35) {
          freq[phrase] = (freq[phrase] || 0) + 1;
        }
      }

      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      for (const [phrase] of sorted.slice(0, 5)) {
        topicSet.add(phrase);
      }
    }

    const topicsArray = Array.from(topicSet).slice(0, 6);
    return topicsArray.length > 0 ? topicsArray : ['Core Concepts', 'Theoretical Principles', 'Applied Systems'];
  }
}
