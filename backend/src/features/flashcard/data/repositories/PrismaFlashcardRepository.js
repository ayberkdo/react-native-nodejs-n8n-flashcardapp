import { FlashcardRepository } from '../../domain/repositories/FlashcardRepository.js';
import { Flashcard } from '../../domain/entities/Flashcard.js';

/**
 * Prisma implementation of FlashcardRepository
 */
export class PrismaFlashcardRepository extends FlashcardRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findAll() {
    try {
      const flashcards = await this.prisma.flashcard.findMany({
        include: {
          language: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return flashcards.map((fc) => Flashcard.fromPersistence(fc));
    } catch (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const flashcard = await this.prisma.flashcard.findUnique({
        where: { id },
        include: {
          language: true,
        },
      });
      return flashcard ? Flashcard.fromPersistence(flashcard) : null;
    } catch (error) {
      throw new Error(`Failed to fetch flashcard by id: ${error.message}`);
    }
  }

  async findByLanguageId(languageId) {
    try {
      const flashcards = await this.prisma.flashcard.findMany({
        where: { languageId },
        include: {
          language: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return flashcards.map((fc) => Flashcard.fromPersistence(fc));
    } catch (error) {
      throw new Error(`Failed to fetch flashcards by language: ${error.message}`);
    }
  }

  async create(flashcardData) {
    try {
      const flashcard = await this.prisma.flashcard.create({
        data: {
          title: flashcardData.title,
          description: flashcardData.description,
          notes: flashcardData.notes,
          words: flashcardData.words, // JSON array
          languageId: flashcardData.languageId,
        },
        include: {
          language: true,
        },
      });
      return Flashcard.fromPersistence(flashcard);
    } catch (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }
  }

  async update(id, flashcardData) {
    try {
      const flashcard = await this.prisma.flashcard.update({
        where: { id },
        data: {
          title: flashcardData.title,
          description: flashcardData.description,
          notes: flashcardData.notes,
          words: flashcardData.words,
          languageId: flashcardData.languageId,
          updatedAt: new Date(),
        },
        include: {
          language: true,
        },
      });
      return Flashcard.fromPersistence(flashcard);
    } catch (error) {
      throw new Error(`Failed to update flashcard: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await this.prisma.flashcard.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete flashcard: ${error.message}`);
    }
  }
}