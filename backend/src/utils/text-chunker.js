/**
 * Split text into chunks for better AI processing
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Target size per chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean text while preserving paragraph structure
  const cleanedText = text
    .replace(/\r\n\r\n/g, "\n\n") // Standardizes Windows double-newlines
    .replace(/\r\n/g, "\n") // Standardizes Windows single-newlines
    .replace(/\s+/g, " ") // Collapses multiple spaces into one
    .replace(/\n\s+/g, "\n") // Removes leading spaces in new lines
    .replace(/\s+\n/g, "\n") // Removes trailing spaces before new lines
    .replace(/\n{3,}/g, "\n\n") // Caps maximum spacing at two newlines
    .trim();

  // Try to split by paragraphs (single or double newlines)
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((paragraph) => paragraph.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  // Main logic:
  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // If single paragraph exceeds chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Split large paragraph into word-based chunks
      for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= paragraphWords.length) break;
        // if (i + chunkSize >= paragraphWordCount) break; // replacement
      }
      continue;
    }

    // If adding this paragraph exceeds chunk size, save current chunk
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++, // post increment: first assign then increment chunkIndex
        pageNumber: 0,
      });

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()]; // [ "50words", "500words" ]
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      // Add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"), // "50 words para \n\n 500 words para"
      chunkIndex: chunkIndex, // last chunkIndex
      pageNumber: 0,
    });
  }
  // Main Logic: Preserves structure (\n\n), respects paragraph boundaries, and tries to keep ideas together.

  // Fallback logic: if no chunks created, split by words
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });
      if (i + chunkSize >= allWords.length) break;
    }
  }
  // Fallback Logic: Destroys structure. It returns dense walls of text joined only by spaces

  return chunks;
};
// Output:-
// https://docs.google.com/document/d/1ntjupn5xWb8GQqfTtCsO7tLHeqs7W1PAX8Oo1EnnjYs/edit?usp=sharing

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
    "what",
    "where",
    "when",
    "who",
    "how",
    "why",
    "are",
    "was",
    "were",
    "be",
    "been",
  ]);

  // Extract and clean query words
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  if (queryWords.length === 0) {
    // // return 1st three chunks (indices: 0, 1, 2) as default
    // return chunks.slice(0, maxChunks).map((chunk) => ({
    //   content: chunk.content,
    //   chunkIndex: chunk.chunkIndex,
    //   pageNumber: chunk.pageNumber,
    //   _id: chunk._id,
    // }));

    // // OR return 0th index chunk as default
    // return chunks.slice(0, 1).map((chunk) => ({
    //   content: chunk.content,
    //   chunkIndex: chunk.chunkIndex,
    //   pageNumber: chunk.pageNumber,
    //   _id: chunk._id,
    // }));

    // OR return no chunks as default (emty array; no relevant chunks can be found)
    return [];
  }

  // give score to all chunks (return scoredChunks array)
  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWordCount = content.split(/\s+/).length;
    let score = 0;

    // Score each query word
    for (const word of queryWords) {
      // Exact word match (higher score)
      const exactMatches = (
        content.match(new RegExp(`\\b${word}\\b`, "g")) || []
      ).length;
      score += exactMatches * 3;

      // Partial match (lower score)
      const partialMatches = (content.match(new RegExp(word, "g")) || [])
        .length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // Bonus: For multiple query words matched in chunk content
    const matchedWordCount = queryWords.filter((word) =>
      content.includes(word)
    ).length;
    if (matchedWordCount > 1) {
      score += matchedWordCount * 2;
    }

    // Normalize by content length
    const normalizedScore = score / Math.sqrt(contentWordCount);

    // Slightly favor chunks from the beginning of the document
    const positionWeight = 1 - (index / chunks.length) * 0.1;
    // Why? In many documents (like news articles or papers), the most relevant introduction or summary information is at the top. This gives earlier chunks a tiny advantage (up to 10%).

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionWeight,
      rawScore: score,
      matchedWords: matchedWordCount,
    };
  });

  // // return 0th index scoredChunk if all scoredChunks score < 0
  // if (
  //   scoredChunks.filter((scoredChunk) => scoredChunk.score > 0).length === 0
  // ) {
  //   return scoredChunks.slice(0, 1);
  //   // OR
  //   // return chunks.slice(0, 1);
  // }

  return scoredChunks
    .filter((scoredChunk) => scoredChunk.score > 0) // remove score < 0 scoredChunks
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Descending Order (Highest to Lowest)
      }
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      return a.chunkIndex - b.chunkIndex; // Ascending Order (Lowest to Highest) (as it is)
    })
    .slice(0, maxChunks); // Result: an array of max length 3 containing the absolute best matches [of chunks of text] found in the document.
};
// Code Explanation: findRelevantChunks() - Chunk Relevance Scoring
// https://docs.google.com/document/d/1OFFbIom3e6a7CgyCm4gQ4zVIE92SsSIIku1VZOJ50qk/edit?usp=sharing
