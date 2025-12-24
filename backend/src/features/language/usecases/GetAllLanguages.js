/**
 * GetAllLanguages Use Case
 * Business logic for retrieving all available languages
 */
export class GetAllLanguages {
  constructor(languageRepository) {
    this.languageRepository = languageRepository;
  }

  async execute() {
    try {
      const languages = await this.languageRepository.findAll();
      
      return {
        success: true,
        data: languages.map((lang) => lang.toJSON()),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
