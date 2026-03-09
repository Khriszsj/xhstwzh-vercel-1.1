import { docToPlainText } from "./doc";
import { RISK_WORDS } from "./risk-words";
import type { RichDoc } from "./types";

export interface ComplianceIssue {
  word: string;
  count: number;
  suggestion: string;
}

export function checkCompliance(doc: RichDoc): ComplianceIssue[] {
  const text = docToPlainText(doc);
  const issues: ComplianceIssue[] = [];

  for (const word of RISK_WORDS) {
    const count = text.split(word).length - 1;
    if (count > 0) {
      issues.push({
        word,
        count,
        suggestion: `建议将“${word}”替换为更中性表达`
      });
    }
  }

  return issues;
}
