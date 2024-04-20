export enum Providers {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    GROQ = 'groq',
    MISTRAL = 'mistral',
    GEMINI = 'gemini'
}

export interface ApiKeys {
    [Providers.OPENAI]: string;
    [Providers.ANTHROPIC]: string;
    [Providers.GROQ]: string;
    [Providers.MISTRAL]: string;
    [Providers.GEMINI]: string;
}