export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastStudiedAt?: string;
}

export type Difficulty = "Easy" | "Normal" | "Hard";

// 에빙하우스 망각곡선 기반 상태
// New: 아직 한 번도 학습하지 않은 단어
// Forgotten: "모른다"로 응답 → 1일 후, 7일 후, 30일 후 복습
// Uncertain: "헷갈린다"로 응답 → 7일 후, 30일 후 복습
// Mastered: "안다"로 응답 → 복습 불필요
export type WordStatus = "New" | "Forgotten" | "Uncertain" | "Mastered";

// 학습 시 응답: 안다 / 헷갈린다 / 모른다
export type StudyResult = "know" | "almost" | "dontKnow";

export interface Word {
  id: string;
  deckId: string;

  word: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  memo: string;

  difficulty: Difficulty;
  tags: string[];

  status: WordStatus;

  // 에빙하우스 복습 단계: 0=첫학습, 1=1일후, 2=7일후, 3=30일후, 4=완료
  reviewPhase: number;

  reviewCount: number;
  correctCount: number;
  wrongCount: number;

  lastReviewedAt?: string;
  nextReviewAt: string;

  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  deckId?: string;
  total: number;
  currentIndex: number;
  studied: number;
  knowCount: number;
  almostCount: number;
  dontKnowCount: number;
  incorrectWordIds?: string[];
  studiedWordIds?: string[];
}
