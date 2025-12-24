/**
 * Get All Flashcards Use Case
 */
export class GetAllFlashcards {
  constructor(flashcardRepository) {
    this.flashcardRepository = flashcardRepository;
  }

  async execute() {
    return await this.flashcardRepository.findAll();
  }
}