/**
 * Flashcard Controller
 * Handles HTTP requests for flashcard operations
 */
export class FlashcardController {
  constructor(
    getAllFlashcardsUseCase,
    getFlashcardByIdUseCase,
    getFlashcardsByLanguageUseCase,
    createFlashcardUseCase,
    updateFlashcardUseCase,
    deleteFlashcardUseCase,
    analyzeStudySessionUseCase,
    saveStudySessionUseCase
  ) {
    this.getAllFlashcardsUseCase = getAllFlashcardsUseCase;
    this.getFlashcardByIdUseCase = getFlashcardByIdUseCase;
    this.getFlashcardsByLanguageUseCase = getFlashcardsByLanguageUseCase;
    this.createFlashcardUseCase = createFlashcardUseCase;
    this.updateFlashcardUseCase = updateFlashcardUseCase;
    this.deleteFlashcardUseCase = deleteFlashcardUseCase;
    this.analyzeStudySessionUseCase = analyzeStudySessionUseCase;
    this.saveStudySessionUseCase = saveStudySessionUseCase;
  }

  async getAllFlashcards(req, res) {
    try {
      const flashcards = await this.getAllFlashcardsUseCase.execute();
      res.json({
        success: true,
        data: flashcards.map((fc) => fc.toJSON()),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getFlashcardById(req, res) {
    try {
      const { id } = req.params;
      const flashcard = await this.getFlashcardByIdUseCase.execute(id);
      res.json({
        success: true,
        data: flashcard.toJSON(),
      });
    } catch (error) {
      const status = error.message === 'Flashcard not found' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getFlashcardsByLanguage(req, res) {
    try {
      const { languageId } = req.params;
      const flashcards = await this.getFlashcardsByLanguageUseCase.execute(parseInt(languageId));
      res.json({
        success: true,
        data: flashcards.map((fc) => fc.toJSON()),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createFlashcard(req, res) {
    try {
      const flashcardData = req.body;
      const flashcard = await this.createFlashcardUseCase.execute(flashcardData);
      res.status(201).json({
        success: true,
        data: flashcard.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateFlashcard(req, res) {
    try {
      const { id } = req.params;
      const flashcardData = req.body;
      const flashcard = await this.updateFlashcardUseCase.execute(id, flashcardData);
      res.json({
        success: true,
        data: flashcard.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteFlashcard(req, res) {
    try {
      const { id } = req.params;
      await this.deleteFlashcardUseCase.execute(id);
      res.json({
        success: true,
        message: 'Flashcard deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async analyzeStudySession(req, res) {
    try {
      const { id } = req.params;
      const sessionData = req.body;
      
      // n8n webhook URL from environment or config
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || null;
      
      const result = await this.analyzeStudySessionUseCase.execute(
        id,
        sessionData,
        n8nWebhookUrl
      );
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async saveStudySession(req, res) {
    try {
      const { id } = req.params;
      const sessionData = req.body;
      
      const studySession = await this.saveStudySessionUseCase.execute(id, sessionData);
      
      res.json({
        success: true,
        data: studySession,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}