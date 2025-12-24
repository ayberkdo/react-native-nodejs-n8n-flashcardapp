/**
 * GetLanguageByCode Use Case
 * Business logic for retrieving a specific language by code
 */
export class GetLanguageByCode {
  constructor(languageRepository) {
    this.languageRepository = languageRepository;
  }

  async execute(code) {
    try {
      if (!code) {
        return {
          success: false,
          error: 'Language code is required',
        };
      }

      const language = await this.languageRepository.findByCode(code);
      
      if (!language) {
        return {
          success: false,
          error: 'Language not found',
        };
      }

      return {
        success: true,
        data: language.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
