import { Router } from 'express';

/**
 * Language Routes
 * Defines API endpoints for language operations
 */
export function createLanguageRoutes(languageController) {
  const router = Router();

  // GET /api/languages - Get all languages
  router.get('/', (req, res) => languageController.getAll(req, res));

  // GET /api/languages/:code - Get language by code
  router.get('/:code', (req, res) => languageController.getByCode(req, res));

  return router;
}
