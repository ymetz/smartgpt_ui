# SmartGPT

## About

SmarGPT enhances the reasoning capabilities of GPT-style models with prompting and in-context learning.
The interface of SmartGPT uses [Chatbot-UI](https://github.com/mckaywrigley/chatbot-ui) as a foundation.

## Features
Right now, **SmartGPT UI** already has some great features:
- Generate smart prompts for your requests utilizing multiple requests, researchers and resolver prompt
- Ability to utilize multiple models, importantly using different models for original requests and researcher/resolver prompt
- Optimized default prompts (system, assistant, researcher prompts,...), but also to ability to use your own prompts
- Save and load prompt configuration
- A history of conversations, including the option to import and export conversations
- An easy way to have conversation with models of different providers via the normal chat interface

## Updates

SmartGPT is not a comercial product, regular updates are not guaranteed.

However, we are working on a [roadmap](https://github.com/ymetz/smartgpt_ui/issues/16).
Your contributions are welcome!

## Local Deployment

**1. Clone Repo**

```bash
git clone 
```

**2. Install Dependencies**

```bash
npm i
```

**4. Run App as DEvelopment Server**

```bash
npm run dev
```

**5. Use It**

By default, the site can be accessed via `localhost:3000`

You should be able to start chatting.

## Configuration

When deploying the application, the following environment variables can be set:

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | ------------------------------                                                                                                            |
| OPENAI_API_HOST                   | `https://api.openai.com`       | The base url, for Azure use `https://<endpoint>.openai.azure.com`                                                                         |
| OPENAI_API_TYPE                   | `openai`                       | The API type, options are `openai` or `azure`                                                                                             |
| OPENAI_API_VERSION                | `2023-03-15-preview`           | Only applicable for Azure OpenAI                                                                                                          |
| DEFAULT_SYSTEM_PROMPT             |                                | The default prompt used for the system, if not provided, the system will use the default prompt for the selected prompt mode               |
| DEFAULT_ASSISTANT_PROMPT          |                                | The default prompt used for the assistant, if not provided, the assistant will use the default prompt for the selected prompt mode        |
| DEFAULT_RESEARCHER_PROMPT         |                                | The default prompt used for the researcher, if not provided, the researcher will use the default prompt for the selected prompt mode      |
| DEFAULT_RESOLVER_PROMPT           |                                | The default prompt used for the resolver, if not provided, the resolver will use the default prompt for the selected prompt mode          |
| DEFAULT_TEMPERATURE               | `0.8`                          | The default temperature used for the system, if not provided, the system will use the default temperature for the selected prompt mode    |
| DEFAULT_PROMPT_MODE               | `smartgpt`                     | The default prompt mode, options are `smartgpt` or `default`                                                                                 |

If you deploy *smartgpt-ui* locally, you have the possiblity to set API keys via environment variables in the backend. This way you do not need set API Keys in the frontend. 
Of course, we do not recommend this for publicily accessible deployments.

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAI_API_KEY                    |                                | The default API key used for authentication with OpenAI        |                                                                           |
| ANTHROPIC_API_KEY                    |                                | The default API key used for authentication with Anthropic Claude API |
| GROQ_API_KEY                    |                                | The default API key used for authentication with Groq API  |
| GEMINI_API_KEY                    |                                | The default API key used for authentication with Google Gemini API (WIP)  |

   
