import { Word, StudyResult } from '../types';
import { getToday, addDays } from './date';

/**
 * 에빙하우스 망각곡선 기반 복습 일정
 * 
 * 복습 단계별 일정:
 *   Phase 0 → Phase 1: 1일 후 (모르는 단어만)
 *   Phase 1 → Phase 2: 7일 후 (모르는 + 헷갈리는 단어)
 *   Phase 2 → Phase 3: 30일 후 (모르는 + 헷갈리는 단어)
 *   Phase 3 → 완료: Mastered
 * 
 * "안다(know)" → 즉시 Mastered (어느 단계에서든 완벽히 알면 복습 끝)
 * "헷갈린다(almost)" → 7일 후, 30일 후 복습 (1일 후에는 안 나옴)
 * "모른다(dontKnow)" → 1일 후부터 모든 단계에서 복습
 */

// 각 복습 단계에서 다음 복습까지의 간격 (일)
const REVIEW_INTERVALS: Record<number, number> = {
  0: 1,   // 첫 학습 → 1일 후
  1: 7,   // 1일 후 복습 → 7일 후
  2: 30,  // 7일 후 복습 → 30일 후
  3: 0,   // 30일 후 복습 → 완료 (Mastered)
};

export const calculateNextReview = (word: Word, result: StudyResult): Partial<Word> => {
  const today = getToday();
  const currentPhase = word.reviewPhase || 0;

  switch (result) {
    case 'know': {
      // "안다" → 완벽히 알고 있으므로 Mastered, 더 이상 복습 불필요
      return {
        status: 'Mastered',
        reviewPhase: 4,
        correctCount: (word.correctCount || 0) + 1,
        reviewCount: (word.reviewCount || 0) + 1,
        lastReviewedAt: today,
        nextReviewAt: '9999-12-31', // 사실상 복습 안 함
      };
    }

    case 'almost': {
      // "헷갈린다" → Uncertain 상태
      // 1일 후 복습에는 포함되지 않고, 7일 후 / 30일 후에만 복습
      const nextPhase = Math.max(currentPhase + 1, 2); // 최소 Phase 2 (7일 후)부터 복습

      if (nextPhase >= 4) {
        // 30일 후 복습까지 완료 → Mastered
        return {
          status: 'Mastered',
          reviewPhase: 4,
          reviewCount: (word.reviewCount || 0) + 1,
          lastReviewedAt: today,
          nextReviewAt: '9999-12-31',
        };
      }

      const daysUntilNext = REVIEW_INTERVALS[nextPhase - 1] || 7;

      return {
        status: 'Uncertain',
        reviewPhase: nextPhase,
        reviewCount: (word.reviewCount || 0) + 1,
        lastReviewedAt: today,
        nextReviewAt: addDays(today, daysUntilNext),
      };
    }

    case 'dontKnow': {
      // "모른다" → Forgotten 상태
      // 1일 후, 7일 후, 30일 후 모든 단계에서 복습
      const nextPhase = currentPhase + 1;

      if (nextPhase >= 4) {
        // 30일 후 복습까지 완료했으나 여전히 모름 → Phase 1부터 다시 시작
        return {
          status: 'Forgotten',
          reviewPhase: 1,
          wrongCount: (word.wrongCount || 0) + 1,
          reviewCount: (word.reviewCount || 0) + 1,
          lastReviewedAt: today,
          nextReviewAt: addDays(today, 1), // 내일 다시 복습
        };
      }

      const daysUntilNext = REVIEW_INTERVALS[currentPhase];

      return {
        status: 'Forgotten',
        reviewPhase: nextPhase,
        wrongCount: (word.wrongCount || 0) + 1,
        reviewCount: (word.reviewCount || 0) + 1,
        lastReviewedAt: today,
        nextReviewAt: addDays(today, daysUntilNext),
      };
    }
  }
};
