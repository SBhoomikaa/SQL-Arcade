
'use client';

import type { Quest, QuestSchema, GeneratedQuest } from './types/quests';
import type { CsvAnalysis } from './types/csv-analysis';

const COMPLETED_QUESTS_KEY = 'completed_quests';
const CUSTOM_QUESTS_KEY = 'custom_quests';

// ====== COMPLETED QUESTS ======

// Gets the list of completed quest IDs from localStorage
export function getCompletedQuests(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const completed = localStorage.getItem(COMPLETED_QUESTS_KEY);
  return completed ? JSON.parse(completed) : [];
}

// Adds a quest ID to the list of completed quests in localStorage
export function completeQuest(questId: string): void {
    if (typeof window === 'undefined') {
        return;
    }
  const completed = getCompletedQuests();
  if (!completed.includes(questId)) {
    const updated = [...completed, questId];
    localStorage.setItem(COMPLETED_QUESTS_KEY, JSON.stringify(updated));
    // Dispatch a custom event so other components can react to progress changes
    window.dispatchEvent(new Event('progressUpdated'));
  }
}

// ====== CUSTOM QUESTS ======

// Gets all custom quests from localStorage
export function getCustomQuests(): Quest[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const quests = localStorage.getItem(CUSTOM_QUESTS_KEY);
  return quests ? JSON.parse(quests) : [];
}

// Adds new custom quests to localStorage
export function addCustomQuests(generatedQuests: GeneratedQuest[], analyses: CsvAnalysis[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const existingQuests = getCustomQuests();
  
  const newQuests: Quest[] = generatedQuests.map((q, index) => ({
      id: `custom-${Date.now()}-${index}`,
      title: q.title,
      description: `A custom quest for your uploaded table(s).`,
      longDescription: q.longDescription,
      difficulty: q.difficulty,
      category: 'Custom Quest',
      initialQuery: `SELECT * FROM ${analyses[0].tableName};`,
      correctQuery: '', // AI will validate logic, not a specific string
      successMessage: 'You have successfully solved the challenge for your custom data!',
      schema: analyses.map(a => ({
          tableName: a.tableName,
          columns: a.columnSchema.map(c => ({ name: c.columnName, type: c.dataType })),
      })),
      resultData: [],
      isCustom: true,
  }));

  const updatedQuests = [...existingQuests, ...newQuests];
  localStorage.setItem(CUSTOM_QUESTS_KEY, JSON.stringify(updatedQuests));
  window.dispatchEvent(new Event('progressUpdated')); // Notify that quests have changed
}

// Gets a single custom quest by ID
export function getCustomQuestById(questId: string): Quest | undefined {
    return getCustomQuests().find(q => q.id === questId);
}


// ====== GENERAL PROGRESS ======

// Calculates the number of badges earned based on completed quests
// For now, let's say 1 badge per 2 completed quests
export function getBadges(): number {
  const completedCount = getCompletedQuests().length;
  return Math.floor(completedCount / 2);
}

// Resets all progress (completed and custom quests)
export function resetProgress(): void {
    if (typeof window === 'undefined') {
        return;
    }
  localStorage.removeItem(COMPLETED_QUESTS_KEY);
  localStorage.removeItem(CUSTOM_QUESTS_KEY);
  window.dispatchEvent(new Event('progressUpdated'));
}
