export class OpenAIError extends Error {
  type: string;
  code: string;

  constructor(message: string, type: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.code = code;
  }
}

export class AnthropicError extends Error {
  type: string;
  code: string;

  constructor(message: string, type: string, code: string) {
    super(message);
    this.name = 'AnthropicError';
    this.type = type;
    this.code = code;
  }
}

export class GroqError extends Error {
  type: string;
  code: string;

  constructor(message: string, type: string, code: string) {
    super(message);
    this.name = 'GroqError';
    this.type = type;
    this.code = code;
  }
}








