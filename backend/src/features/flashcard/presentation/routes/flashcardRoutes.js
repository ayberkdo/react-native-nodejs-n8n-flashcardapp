import { Router } from 'express';

/**
 * Create flashcard routes
 */
export function createFlashcardRoutes(controller) {
  const router = Router();

  // GET /api/flashcards - Get all flashcards
  router.get('/', (req, res) => controller.getAllFlashcards(req, res));

  // GET /api/flashcards/:id - Get flashcard by ID
  router.get('/:id', (req, res) => controller.getFlashcardById(req, res));

  // GET /api/flashcards/language/:languageId - Get flashcards by language
  router.get('/language/:languageId', (req, res) => controller.getFlashcardsByLanguage(req, res));

  // POST /api/flashcards - Create new flashcard
  router.post('/', (req, res) => controller.createFlashcard(req, res));

  // PUT /api/flashcards/:id - Update flashcard
  router.put('/:id', (req, res) => controller.updateFlashcard(req, res));

  // DELETE /api/flashcards/:id - Delete flashcard
  router.delete('/:id', (req, res) => controller.deleteFlashcard(req, res));

  // POST /api/flashcards/:id/analyze - Analyze study session with AI
  router.post('/:id/analyze', (req, res) => controller.analyzeStudySession(req, res));

  // POST /api/flashcards/:id/save-session - Save study session without AI
  router.post('/:id/save-session', (req, res) => controller.saveStudySession(req, res));

  return router;
}