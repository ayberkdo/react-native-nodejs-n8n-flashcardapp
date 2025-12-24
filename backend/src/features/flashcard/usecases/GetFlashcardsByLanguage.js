/**
 * Get Flashcards By Language Use Case
 */
export class GetFlashcardsByLanguage {
  constructor(flashcardRepository) {
    this.flashcardRepository = flashcardRepository;
  }

  async execute(languageId) {
    return await this.flashcardRepository.findByLanguageId(languageId);
  }
}