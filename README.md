# SmartGPT

## About

SmarGPT enhances the reasoning capabilities of GPT-style models with prompting and in-context learning.



The interface of SmartGPT uses [Chatbot-UI](https://github.com/mckaywrigley/chatbot-ui) as a foundation.

## Updates

SmartGPT is not a comercial product, regular updates are not guaranteed.

**1. Clone Repo**

```bash
git clone 
```

**2. Install Dependencies**

```bash
npm i
```

**4. Run App**

```bash
npm run dev
```

**5. Use It**

You should be able to start chatting.

## Configuration

When deploying the application, the following environment variables can be set:

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | OpenAI                                                                                   |
| OPENAI_API_HOST                   | `https://api.openai.com`       | The base url, for Azure use `https://<endpoint>.openai.azure.com`                                                                         |
| OPENAI_API_TYPE                   | `openai`                       | The API type, options are `openai` or `azure`                                                                                             |
| OPENAI_API_VERSION                | `2023-03-15-preview`           | Only applicable for Azure OpenAI                                                                                                          |
| DEFAULT_SYSTEM_PROMPT             |                                | The default prompt used for the system, if not provided, the system will use the default prompt for the selected prompt mode               |
| DEFAULT_ASSISTANT_PROMPT          |                                | The default prompt used for the assistant, if not provided, the assistant will use the default prompt for the selected prompt mode        |
| DEFAULT_RESEARCHER_PROMPT         |                                | The default prompt used for the researcher, if not provided, the researcher will use the default prompt for the selected prompt mode      |
| DEFAULT_RESOLVER_PROMPT           |                                | The default prompt used for the resolver, if not provided, the resolver will use the default prompt for the selected prompt mode          |
| DEFAULT_TEMPERATURE               | `0.8`                          | The default temperature used for the system, if not provided, the system will use the default temperature for the selected prompt mode    |
| DEFAULT_PROMPT_MODE               | `smartgpt`                     | The default prompt mode, options are `smartgpt` or `default`                                                                                 |
