import {
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
} from '@/utils/app/const';

import {
  AnthropicModel,
  AnthropicModelID,
  AnthropicModels,
} from '@/types/anthropic';
import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { provider, key } = (await req.json()) as {
      provider: string;
      key: string;
    };

    let url: string;
    let response: Response;

    if (provider === 'openai') {
      // pass, handled below
    } else if (provider === 'anthropic') {
      if (key === '') {
        return new Response(JSON.stringify({}), { status: 200 });
      }
      return new Response(
        JSON.stringify(
          Object.keys(AnthropicModels).map((key) => ({
            id: key,
            name: AnthropicModels[key as keyof typeof AnthropicModels].name,
          })),
        ),
        { status: 200 },
      );
    } else if (provider === 'mistral') {
      url = 'https://api.mistral.com/models';
    } else if (provider === 'gemini') {
      url = 'https://api.gemini.com/models';
    } else {
      return new Response('Error: Unknown Provider', { status: 500 });
    }

    // only do dynamic model resolution for OpenAI
    url = `${OPENAI_API_HOST}/v1/models`;
    if (OPENAI_API_TYPE === 'azure') {
      url = `${OPENAI_API_HOST}/openai/deployments?api-version=${OPENAI_API_VERSION}`;
    }

    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(OPENAI_API_TYPE === 'openai' && {
          Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
        }),
        ...(OPENAI_API_TYPE === 'azure' && {
          'api-key': `${key ? key : process.env.OPENAI_API_KEY}`,
        }),
        ...(OPENAI_API_TYPE === 'openai' &&
          OPENAI_ORGANIZATION && {
            'OpenAI-Organization': OPENAI_ORGANIZATION,
          }),
      },
    });

    if (response.status === 401) {
      return new Response(response.body, {
        status: 500,
        headers: response.headers,
      });
    } else if (response.status !== 200) {
      console.error(
        provider +
          ` API returned an error ${response.status}: ${await response.text()}`,
      );
      throw new Error(provider + ' API returned an error');
    }

    const json = await response.json();

    const models: OpenAIModel[] = json.data
      .map((model: any) => {
        const model_name = OPENAI_API_TYPE === 'azure' ? model.model : model.id;
        for (const [key, value] of Object.entries(OpenAIModelID)) {
          if (value === model_name) {
            return {
              id: model.id,
              name: OpenAIModels[value].name,
            };
          }
        }
      })
      .filter(Boolean);

    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
};

export default handler;
