import { PrismaClient } from '@prisma/client';
import { PrismaLanguageRepository } from '../features/language/data/repositories/PrismaLanguageRepository.js';
import { GetAllLanguages } from '../features/language/usecases/GetAllLanguages.js';
import { GetLanguageByCode } from '../features/language/usecases/GetLanguageByCode.js';
import { LanguageController } from '../features/language/presentation/controllers/LanguageController.js';

// Flashcard imports
import { PrismaFlashcardRepository } from '../features/flashcard/data/repositories/PrismaFlashcardRepository.js';
import { GetAllFlashcards } from '../features/flashcard/usecases/GetAllFlashcards.js';
import { GetFlashcardById } from '../features/flashcard/usecases/GetFlashcardById.js';
import { GetFlashcardsByLanguage } from '../features/flashcard/usecases/GetFlashcardsByLanguage.js';
import { CreateFlashcard } from '../features/flashcard/usecases/CreateFlashcard.js';
import { UpdateFlashcard } from '../features/flashcard/usecases/UpdateFlashcard.js';
import { DeleteFlashcard } from '../features/flashcard/usecases/DeleteFlashcard.js';
import { AnalyzeStudySession } from '../features/flashcard/usecases/AnalyzeStudySession.js';
import { SaveStudySession } from '../features/flashcard/usecases/SaveStudySession.js';
import { FlashcardController } from '../features/flashcard/presentation/controllers/FlashcardController.js';

/**
 * Dependency Injection Container
 * Manages application dependencies and their lifecycle
 */
class Container {
  constructor() {
    this._instances = new Map();
    this._setupDependencies();
  }

  _setupDependencies() {
    // Database
    this._instances.set('prisma', new PrismaClient());

    // Language Repositories
    const languageRepository = new PrismaLanguageRepository(this.get('prisma'));
    this._instances.set('languageRepository', languageRepository);

    // Language Use Cases
    const getAllLanguagesUseCase = new GetAllLanguages(languageRepository);
    this._instances.set('getAllLanguagesUseCase', getAllLanguagesUseCase);

    const getLanguageByCodeUseCase = new GetLanguageByCode(languageRepository);
    this._instances.set('getLanguageByCodeUseCase', getLanguageByCodeUseCase);

    // Language Controllers
    const languageController = new LanguageController(
      getAllLanguagesUseCase,
      getLanguageByCodeUseCase
    );
    this._instances.set('languageController', languageController);

    // Flashcard Repositories
    const flashcardRepository = new PrismaFlashcardRepository(this.get('prisma'));
    this._instances.set('flashcardRepository', flashcardRepository);

    // Flashcard Use Cases
    const getAllFlashcardsUseCase = new GetAllFlashcards(flashcardRepository);
    this._instances.set('getAllFlashcardsUseCase', getAllFlashcardsUseCase);

    const getFlashcardByIdUseCase = new GetFlashcardById(flashcardRepository);
    this._instances.set('getFlashcardByIdUseCase', getFlashcardByIdUseCase);

    const getFlashcardsByLanguageUseCase = new GetFlashcardsByLanguage(flashcardRepository);
    this._instances.set('getFlashcardsByLanguageUseCase', getFlashcardsByLanguageUseCase);

    const createFlashcardUseCase = new CreateFlashcard(flashcardRepository);
    this._instances.set('createFlashcardUseCase', createFlashcardUseCase);

    const updateFlashcardUseCase = new UpdateFlashcard(flashcardRepository);
    this._instances.set('updateFlashcardUseCase', updateFlashcardUseCase);

    const deleteFlashcardUseCase = new DeleteFlashcard(flashcardRepository);
    this._instances.set('deleteFlashcardUseCase', deleteFlashcardUseCase);

    const analyzeStudySessionUseCase = new AnalyzeStudySession(flashcardRepository, this.get('prisma'));
    this._instances.set('analyzeStudySessionUseCase', analyzeStudySessionUseCase);

    const saveStudySessionUseCase = new SaveStudySession(flashcardRepository, this.get('prisma'));
    this._instances.set('saveStudySessionUseCase', saveStudySessionUseCase);

    // Flashcard Controllers
    const flashcardController = new FlashcardController(
      getAllFlashcardsUseCase,
      getFlashcardByIdUseCase,
      getFlashcardsByLanguageUseCase,
      createFlashcardUseCase,
      updateFlashcardUseCase,
      deleteFlashcardUseCase,
      analyzeStudySessionUseCase,
      saveStudySessionUseCase
    );
    this._instances.set('flashcardController', flashcardController);
  }

  get(key) {
    if (!this._instances.has(key)) {
      throw new Error(`Dependency '${key}' not found in container`);
    }
    return this._instances.get(key);
  }

  async cleanup() {
    const prisma = this._instances.get('prisma');
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export const container = new Container();