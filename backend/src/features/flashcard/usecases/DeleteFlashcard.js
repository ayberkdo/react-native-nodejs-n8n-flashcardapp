/**
 * Delete Flashcard Use Case
 */
export class DeleteFlashcard {
  constructor(flashcardRepository) {
    this.flashcardRepository = flashcardRepository;
  }

  async execute(id) {
    return await this.flashcardRepository.delete(id);
  }
}