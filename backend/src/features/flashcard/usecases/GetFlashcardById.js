/**
 * Get Flashcard By ID Use Case
 */
export class GetFlashcardById {
  constructor(flashcardRepository) {
    this.flashcardRepository = flashcardRepository;
  }

  async execute(id) {
    const flashcard = await this.flashcardRepository.findById(id);
    if (!flashcard) {
      throw new Error('Flashcard not found');
    }
    return flashcard;
  }
}