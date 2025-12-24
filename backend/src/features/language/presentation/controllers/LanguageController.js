/**
 * Language Controller
 * Handles HTTP requests for language-related operations
 */
export class LanguageController {
  constructor(getAllLanguagesUseCase, getLanguageByCodeUseCase) {
    this.getAllLanguagesUseCase = getAllLanguagesUseCase;
    this.getLanguageByCodeUseCase = getLanguageByCodeUseCase;
  }

  async getAll(req, res) {
    try {
      const result = await this.getAllLanguagesUseCase.execute();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getByCode(req, res) {
    try {
      const { code } = req.params;
      const result = await this.getLanguageByCodeUseCase.execute(code);

      if (!result.success) {
        const statusCode = result.error === 'Language not found' ? 404 : 400;
        return res.status(statusCode).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
