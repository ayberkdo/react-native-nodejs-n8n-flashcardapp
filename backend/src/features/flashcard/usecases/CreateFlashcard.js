/**
 * Create Flashcard Use Case
 */
export class CreateFlashcard {
  constructor(flashcardRepository) {
    this.flashcardRepository = flashcardRepository;
  }

  async execute(flashcardData) {
    // Validation
    if (!flashcardData.title || flashcardData.title.trim() === '') {
      throw new Error('Title is required');
    }

    if (!flashcardData.languageId) {
      throw new Error('Language ID is required');
    }

    if (!flashcardData.words || !Array.isArray(flashcardData.words) || flashcardData.words.length === 0) {
      throw new Error('At least one word pair is required');
    }

    // Validate words structure
    for (const word of flashcardData.words) {
      if (!word.front || !word.back) {
        throw new Error('Each word must have front and back values');
      }
    }

    return await this.flashcardRepository.create(flashcardData);
  }
}