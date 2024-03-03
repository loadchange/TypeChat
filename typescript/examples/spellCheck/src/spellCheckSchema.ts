// Check for spelling errors, grammatical mistakes, improper use, and awkwardness in variable names and comments within the code files.

export interface SpellCheckResponse {
  // Spelling error level of the code file
  //  // error: There are misspelled words.
  //  // warning: Grammatical errors or awkward phrasing in phrases or sentences
  //  // info: Grammar Optimization Advice
  //  // none: No errors
  level: "error" | "warning" | "info" | "none";

  // The list of errors
  errors: Correction[];

  // List of errors due to inappropriate phrase pre-release
  warnings: Correction[];

  // Optimization Suggestion List
  suggestions: Correction[];
}

interface Correction {
  // The original text in the code
  original: string;
  // After correction or optimization
  corrected: string;
}
