/**
 * Update Flashcard Use Case
 */
export class UpdateFlashcard {
  constructor(flashcardRepository) {
    this.flashcardRepository = flashcardRepository;
  }

  async execute(id, flashcardData) {
    // Validation
    if (flashcardData.title && flashcardData.title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    if (flashcardData.words) {
      if (!Array.isArray(flashcardData.words) || flashcardData.words.length === 0) {
        throw new Error('At least one word pair is required');
      }

      for (const word of flashcardData.words) {
        if (!word.front || !word.back) {
          throw new Error('Each word must have front and back values');
        }
      }
    }

    return await this.flashcardRepository.update(id, flashcardData);
  }
}