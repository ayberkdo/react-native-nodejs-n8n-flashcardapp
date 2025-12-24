/**
 * Language Domain Entity
 * Represents a language in the domain model
 */
export class Language {
  constructor({ id, code, name }) {
    this.id = id;
    this.code = code;
    this.name = name;
  }

  static fromPersistence(data) {
    return new Language({
      id: data.id,
      code: data.code,
      name: data.name,
    });
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
    };
  }
}
