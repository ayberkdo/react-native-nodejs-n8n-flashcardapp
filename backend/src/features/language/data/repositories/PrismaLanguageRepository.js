import { PrismaClient } from '@prisma/client';
import { LanguageRepository } from '../../domain/repositories/LanguageRepository.js';
import { Language } from '../../domain/entities/Language.js';

/**
 * Prisma implementation of LanguageRepository
 */
export class PrismaLanguageRepository extends LanguageRepository {
  constructor(prismaClient) {
    super();
    this.prisma = prismaClient;
  }

  async findAll() {
    try {
      const languages = await this.prisma.language.findMany({
        orderBy: { name: 'asc' },
      });
      return languages.map((lang) => Language.fromPersistence(lang));
    } catch (error) {
      throw new Error(`Failed to fetch languages: ${error.message}`);
    }
  }

  async findByCode(code) {
    try {
      const language = await this.prisma.language.findUnique({
        where: { code },
      });
      return language ? Language.fromPersistence(language) : null;
    } catch (error) {
      throw new Error(`Failed to fetch language by code: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const language = await this.prisma.language.findUnique({
        where: { id },
      });
      return language ? Language.fromPersistence(language) : null;
    } catch (error) {
      throw new Error(`Failed to fetch language by id: ${error.message}`);
    }
  }
}
