/**
 * Analyze Study Session Use Case
 * Sends study data to n8n/Gemini for AI analysis and saves results
 */
class AnalyzeStudySession {
  constructor(flashcardRepository, prismaClient) {
    this.flashcardRepository = flashcardRepository;
    this.prisma = prismaClient;
  }

  async execute(flashcardId, sessionData, n8nWebhookUrl) {
    // Validate input
    if (!flashcardId || !sessionData) {
      throw new Error('Flashcard ID and session data are required');
    }

    const { knownCount, unknownCount, skippedCount, unknownWords = [] } = sessionData;

    // Get flashcard with language for context
    const flashcardData = await this.prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: { language: true },
    });
    
    if (!flashcardData) {
      throw new Error('Flashcard not found');
    }

    try {
      // Call n8n webhook with study data
      let aiResponse = null;
      if (n8nWebhookUrl && unknownWords.length > 0) {
        const n8nPayload = {
          flashcardId,
          flashcardTitle: flashcardData.title,
          language: {
            id: flashcardData.language.id,
            code: flashcardData.language.code,
            name: flashcardData.language.name,
          },
          results: { knownCount, unknownCount, skippedCount, total: knownCount + unknownCount + skippedCount },
          unknownWords,
          timestamp: new Date().toISOString(),
        };

        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload),
        });

        if (!response.ok) {
          console.error('n8n webhook failed:', response.statusText);
        } else {
          const rawResponse = await response.json();
          console.log('=== n8n Raw Response ===');
          console.log(JSON.stringify(rawResponse, null, 2));
          console.log('========================');
          
          // n8n response format variations:
          // 1. Direct output: { output: { aiFeedback, wordAnalysis } }
          // 2. Array with response: [{ response: { output: {...} } }]
          // 3. Direct format: { aiFeedback, wordAnalysis }
          
          if (rawResponse.output) {
            // Format 1: Direct output object
            aiResponse = rawResponse.output;
          } else if (Array.isArray(rawResponse) && rawResponse.length > 0) {
            // Format 2: Array with nested structure
            const firstItem = rawResponse[0];
            if (firstItem.response && firstItem.response.output) {
              aiResponse = firstItem.response.output;
            }
          } else if (rawResponse.aiFeedback || rawResponse.wordAnalysis) {
            // Format 3: Direct format
            aiResponse = rawResponse;
          }
          
          console.log('=== Parsed AI Response ===');
          console.log(JSON.stringify(aiResponse, null, 2));
          console.log('==========================');
        }
      }

      // Use Prisma transaction for atomic operations
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create StudySession
        const studySession = await tx.studySession.create({
          data: {
            flashcardId,
            knownCount: knownCount || 0,
            unknownCount: unknownCount || 0,
            skippedCount: skippedCount || 0,
            aiFeedback: aiResponse?.aiFeedback || null,
          },
        });

        // 2. Update WordAnalytics if AI provided analysis
        if (aiResponse?.wordAnalysis && Array.isArray(aiResponse.wordAnalysis)) {
          for (const wordData of aiResponse.wordAnalysis) {
            await tx.wordAnalytics.upsert({
              where: {
                flashcardId_wordKey: {
                  flashcardId,
                  wordKey: wordData.wordKey,
                },
              },
              update: {
                wrongCount: { increment: 1 },
                aiMnemonic: wordData.aiMnemonic || undefined,
                difficultyLevel: wordData.difficultyLevel || undefined,
              },
              create: {
                flashcardId,
                wordKey: wordData.wordKey,
                correctCount: 0,
                wrongCount: 1,
                aiMnemonic: wordData.aiMnemonic || null,
                difficultyLevel: wordData.difficultyLevel || null,
              },
            });
          }
        }

        // 3. Update Flashcard lastStudiedAt
        await tx.flashcard.update({
          where: { id: flashcardId },
          data: { lastStudiedAt: new Date() },
        });

        return studySession;
      });

      return {
        studySession: result,
        aiAnalysis: aiResponse ? {
          aiFeedback: aiResponse.aiFeedback || '',
          wordAnalysis: aiResponse.wordAnalysis || []
        } : null,
      };
    } catch (error) {
      console.error('AnalyzeStudySession error:', error);
      throw new Error(`Failed to analyze study session: ${error.message}`);
    }
  }
}

export { AnalyzeStudySession };
