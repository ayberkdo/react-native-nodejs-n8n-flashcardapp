/**
 * Flashcard Service
 * Handles all API calls related to flashcard management
 */

import { getApiUrl } from '@/constants/api';

export interface WordPair {
  front: string;
  back: string;
}

export interface FlashcardDTO {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  words: WordPair[];
  languageId: number;
  lastStudiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardInput {
  title: string;
  description?: string;
  notes?: string;
  words: WordPair[];
  languageId: number;
}

export interface StudySessionData {
  knownCount: number;
  unknownCount: number;
  skippedCount: number;
  unknownWords?: WordPair[];
}

export interface WordAnalysis {
  wordKey: string;
  aiMnemonic: string;
  difficultyLevel: number;
}

export interface AnalyzeStudySessionResponse {
  studySession: {
    id: number;
    flashcardId: string;
    knownCount: number;
    unknownCount: number;
    skippedCount: number;
    aiFeedback: string | null;
    createdAt: string;
  };
  aiAnalysis: {
    aiFeedback: string;
    wordAnalysis: WordAnalysis[];
  } | null;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class FlashcardService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiUrl('flashcards');
  }

  /**
   * Fetch all flashcards
   */
  async getAllFlashcards(): Promise<FlashcardDTO[]> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw {
          message: `Failed to fetch flashcards: ${response.statusText}`,
          status: response.status,
          code: 'FETCH_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      if (json?.success && Array.isArray(json.data)) {
        return json.data as FlashcardDTO[];
      }

      throw {
        message: 'Invalid API response format',
        code: 'INVALID_RESPONSE',
      } as ApiError;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Fetch flashcards by language ID
   */
  async getFlashcardsByLanguage(languageId: number): Promise<FlashcardDTO[]> {
    try {
      const response = await fetch(`${this.baseURL}/language/${languageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw {
          message: `Failed to fetch flashcards: ${response.statusText}`,
          status: response.status,
          code: 'FETCH_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      if (json?.success && Array.isArray(json.data)) {
        return json.data as FlashcardDTO[];
      }

      throw {
        message: 'Invalid API response format',
        code: 'INVALID_RESPONSE',
      } as ApiError;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Create a new flashcard
   */
  async createFlashcard(flashcardData: CreateFlashcardInput): Promise<FlashcardDTO> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcardData),
      });

      if (!response.ok) {
        const json = await response.json();
        throw {
          message: json.message || `Failed to create flashcard: ${response.statusText}`,
          status: response.status,
          code: 'CREATE_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      if (json?.success && json.data) {
        return json.data as FlashcardDTO;
      }

      throw {
        message: 'Invalid API response format',
        code: 'INVALID_RESPONSE',
      } as ApiError;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Get flashcard by ID
   */
  async getFlashcardById(id: string): Promise<FlashcardDTO> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw {
          message: `Failed to fetch flashcard: ${response.statusText}`,
          status: response.status,
          code: 'FETCH_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      if (json?.success && json.data) {
        return json.data as FlashcardDTO;
      }

      throw {
        message: 'Invalid API response format',
        code: 'INVALID_RESPONSE',
      } as ApiError;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Update an existing flashcard
   */
  async updateFlashcard(id: string, flashcardData: CreateFlashcardInput): Promise<FlashcardDTO> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcardData),
      });

      if (!response.ok) {
        const json = await response.json();
        throw {
          message: json.message || `Failed to update flashcard: ${response.statusText}`,
          status: response.status,
          code: 'UPDATE_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      if (json?.success && json.data) {
        return json.data as FlashcardDTO;
      }

      throw {
        message: 'Invalid API response format',
        code: 'INVALID_RESPONSE',
      } as ApiError;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const json = await response.json();
        throw {
          message: json.message || `Failed to delete flashcard: ${response.statusText}`,
          status: response.status,
          code: 'DELETE_ERROR',
        } as ApiError;
      }
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Analyze study session with AI
   */
  async analyzeStudySession(
    id: string,
    sessionData: StudySessionData
  ): Promise<AnalyzeStudySessionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const json = await response.json();
        throw {
          message: json.message || `Failed to analyze study session: ${response.statusText}`,
          status: response.status,
          code: 'ANALYZE_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      if (json?.success && json.data) {
        return json.data as AnalyzeStudySessionResponse;
      }

      throw {
        message: 'Invalid API response format',
        code: 'INVALID_RESPONSE',
      } as ApiError;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Save study session without AI analysis
   */
  async saveStudySession(
    id: string,
    sessionData: StudySessionData
  ): Promise<{ studySession: any }> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/save-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const json = await response.json();
        throw {
          message: json.message || `Failed to save study session: ${response.statusText}`,
          status: response.status,
          code: 'SAVE_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      if (json?.success && json.data) {
        return json.data;
      }

      throw {
        message: 'Invalid API response format',
        code: 'INVALID_RESPONSE',
      } as ApiError;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }
}

// Export singleton instance
export const flashcardService = new FlashcardService();

// Export class for testing purposes
export default FlashcardService;