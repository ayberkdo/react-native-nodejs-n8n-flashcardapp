/**
 * Flashcard Domain Entity
 * Represents a flashcard in the domain model
 */
export class Flashcard {
  constructor({ id, title, description, notes, words, languageId, lastStudiedAt, createdAt, updatedAt }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.notes = notes;
    this.words = words; // Array of { front, back }
    this.languageId = languageId;
    this.lastStudiedAt = lastStudiedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromPersistence(data) {
    return new Flashcard({
      id: data.id,
      title: data.title,
      description: data.description,
      notes: data.notes,
      words: data.words, // JSON field from database
      languageId: data.languageId,
      lastStudiedAt: data.lastStudiedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      notes: this.notes,
      words: this.words,
      languageId: this.languageId,
      lastStudiedAt: this.lastStudiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}