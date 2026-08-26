import { ProblemAnalysis } from "./aiService";
import { CommunityProblem } from "./universityMockService";

export interface DuplicateMatchCandidate {
  problemId: string;
  candidateId: string;
  candidateTitle: string;
  candidateLocation: string;
  similarityScore: number; // 0 - 100
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  matchReasons: string[];
  suggestedAction: "CLUSTER" | "LINK_RELATED" | "INDEPENDENT";
}

export interface ProblemCluster {
  id: string;
  primaryProblemId: string;
  primaryTitle: string;
  category: string;
  district: string;
  state: string;
  memberProblemIds: string[];
  status: "ACTIVE" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
}

// Configurable Thresholds
export class DuplicateThresholds {
  static readonly HIGH = 80;
  static readonly MEDIUM = 60;
}

/**
 * Calculates semantic and metadata similarity between a new problem and an existing candidate problem.
 */
export function calculateSimilarity(
  target: CommunityProblem,
  candidate: CommunityProblem,
  targetAnalysis?: ProblemAnalysis,
  candidateAnalysis?: ProblemAnalysis
): DuplicateMatchCandidate | null {
  // Ignore self comparison
  if (target.id === candidate.id) return null;

  let totalScore = 0;
  const matchReasons: string[] = [];

  // 1. Location Matching (Max 25 points)
  const isSameState = target.state.toLowerCase() === candidate.state.toLowerCase();
  const isSameDistrict = target.district.toLowerCase() === candidate.district.toLowerCase();

  if (isSameDistrict && isSameState) {
    totalScore += 25;
    matchReasons.push(`Same District (${target.district}, ${target.state})`);
  } else if (isSameState) {
    totalScore += 10;
    matchReasons.push(`Same State (${target.state})`);
  }

  // 2. Category & Subcategory Matching (Max 25 points)
  const isSameCategory = target.category.toLowerCase() === candidate.category.toLowerCase();
  if (isSameCategory) {
    totalScore += 15;
    matchReasons.push(`Same Category (${target.category})`);
  }

  if (targetAnalysis && candidateAnalysis) {
    if (targetAnalysis.subcategory.toLowerCase() === candidateAnalysis.subcategory.toLowerCase()) {
      totalScore += 10;
      matchReasons.push(`Same Subcategory (${targetAnalysis.subcategory})`);
    }
  }

  // 3. Text Semantic & Keyword Overlap (Max 35 points)
  const targetWords = getKeywords(`${target.title} ${target.description}`);
  const candidateWords = getKeywords(`${candidate.title} ${candidate.description}`);

  const intersection = targetWords.filter((w) => candidateWords.includes(w));
  const unionSize = new Set([...targetWords, ...candidateWords]).size;
  const wordOverlapRatio = unionSize > 0 ? intersection.length / unionSize : 0;

  const textScore = Math.round(wordOverlapRatio * 35);
  totalScore += textScore;
  if (textScore > 10) {
    matchReasons.push(`High keyword overlap (${intersection.slice(0, 4).join(", ")})`);
  }

  // 4. Expertise & Domain Alignment (Max 15 points)
  const targetExp = target.requiredExpertise || targetAnalysis?.requiredExpertise || [];
  const candidateExp = candidate.requiredExpertise || candidateAnalysis?.requiredExpertise || [];

  const commonExp = targetExp.filter((e) => candidateExp.some((ce) => ce.toLowerCase() === e.toLowerCase()));
  if (commonExp.length > 0) {
    totalScore += 15;
    matchReasons.push(`Matching expertise (${commonExp.join(", ")})`);
  }

  // Clamp total score between 0 and 100
  const normalizedScore = Math.min(Math.max(totalScore, 0), 100);

  // Confidence Level Determination
  let confidenceLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let suggestedAction: "CLUSTER" | "LINK_RELATED" | "INDEPENDENT" = "INDEPENDENT";

  if (normalizedScore >= DuplicateThresholds.HIGH) {
    confidenceLevel = "HIGH";
    suggestedAction = "CLUSTER";
  } else if (normalizedScore >= DuplicateThresholds.MEDIUM) {
    confidenceLevel = "MEDIUM";
    suggestedAction = "LINK_RELATED";
  }

  // Ignore matches below 40% similarity
  if (normalizedScore < 40) return null;

  return {
    problemId: target.id,
    candidateId: candidate.id,
    candidateTitle: candidate.title,
    candidateLocation: `${candidate.district}, ${candidate.state}`,
    similarityScore: normalizedScore,
    confidenceLevel,
    matchReasons,
    suggestedAction,
  };
}

/**
 * Finds all potential duplicate candidate problems for a target problem.
 */
export function findSimilarProblems(
  targetProblem: CommunityProblem,
  existingProblems: CommunityProblem[],
  getAnalysisFn?: (id: string) => ProblemAnalysis | undefined
): DuplicateMatchCandidate[] {
  const targetAnalysis = getAnalysisFn ? getAnalysisFn(targetProblem.id) : undefined;
  const candidates: DuplicateMatchCandidate[] = [];

  for (const candidate of existingProblems) {
    const candidateAnalysis = getAnalysisFn ? getAnalysisFn(candidate.id) : undefined;
    const match = calculateSimilarity(targetProblem, candidate, targetAnalysis, candidateAnalysis);
    if (match) {
      candidates.push(match);
    }
  }

  // Sort candidates by highest similarity score first
  return candidates.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Utility helper to extract significant keywords from text
 */
function getKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", "to", "for", 
    "of", "with", "by", "from", "up", "about", "into", "over", "after", "has", "have", "had", "this", 
    "that", "these", "those", "due", "because", "facing", "facing", "problem", "issue", "village", "villages"
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}
