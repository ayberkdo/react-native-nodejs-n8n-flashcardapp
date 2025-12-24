/**
 * Save Study Session Use Case
 * Saves study results without AI analysis
 */
class SaveStudySession {
  constructor(flashcardRepository, prismaClient) {
    this.flashcardRepository = flashcardRepository;
    this.prisma = prismaClient;
  }

  async execute(flashcardId, sessionData) {
    if (!flashcardId || !sessionData) {
      throw new Error('Flashcard ID and session data are required');
    }

    const { knownCount, unknownCount, skippedCount } = sessionData;

    // Verify flashcard exists
    const flashcard = await this.flashcardRepository.findById(flashcardId);
    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create StudySession without AI feedback
        const studySession = await tx.studySession.create({
          data: {
            flashcardId,
            knownCount: knownCount || 0,
            unknownCount: unknownCount || 0,
            skippedCount: skippedCount || 0,
            aiFeedback: null,
          },
        });

        // Update Flashcard lastStudiedAt
        await tx.flashcard.update({
          where: { id: flashcardId },
          data: { lastStudiedAt: new Date() },
        });

        return studySession;
      });

      return result;
    } catch (error) {
      console.error('SaveStudySession error:', error);
      throw new Error(`Failed to save study session: ${error.message}`);
    }
  }
}

export { SaveStudySession };
