/**
 * Language Service
 * Handles all API calls related to language management
 * Following 2025 best practices: type safety, error handling, and clean architecture
 */

const API_BASE_URL = 'http://192.168.1.21:3000/api';

export interface LanguageDTO {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class LanguageService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Fetch all available languages from the backend
   * @returns Promise with array of languages
   * @throws ApiError if request fails
   */
  async getAllLanguages(): Promise<LanguageDTO[]> {
    try {
      const response = await fetch(`${this.baseURL}/languages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw {
          message: `Failed to fetch languages: ${response.statusText}`,
          status: response.status,
          code: 'FETCH_ERROR',
        } as ApiError;
      }

      const json = await response.json();

      // 🔥 BACKEND RESPONSE'U NORMALIZE EDİYORUZ
      if (json?.success && Array.isArray(json.data)) {
        return json.data as LanguageDTO[];
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
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Fetch a specific language by its code
   * @param code Language code (e.g., 'en', 'tr')
   * @returns Promise with language data
   * @throws ApiError if request fails
   */
  async getLanguageByCode(code: string): Promise<LanguageDTO> {
    try {
      const response = await fetch(`${this.baseURL}/languages/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw {
            message: `Language with code '${code}' not found`,
            status: 404,
            code: 'NOT_FOUND',
          } as ApiError;
        }
        throw {
          message: `Failed to fetch language: ${response.statusText}`,
          status: response.status,
          code: 'FETCH_ERROR',
        } as ApiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  /**
   * Update the base URL (useful for different environments)
   * @param url New base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// Export singleton instance
export const languageService = new LanguageService();

export const getFlagEmoji = (code: string) => {
  // Dil kodlarını ülke kodlarına eşleme (Gerekirse)
  // Unicode'da 'en' diye bir bayrak yoktur, 'gb' veya 'us' vardır.
  let countryCode = code.toLowerCase();
  if (countryCode === 'en') countryCode = 'gb'; 

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => 
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
};

// Export class for testing purposes
export default LanguageService;
