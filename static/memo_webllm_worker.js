// Pinned third-party runtime. Model inference runs here, not on the site server.
import {CreateMLCEngine, prebuiltAppConfig} from 'https://esm.run/@mlc-ai/web-llm@0.2.85';
import {createModelFetch} from './memo_model_download.mjs';
import {memoStorySchema, memoGenerationError} from './memo_ai_format.mjs';
let loadingId = null;
self.fetch = createModelFetch(self.fetch.bind(self), {
    onRetry: (file, attempt) => self.postMessage({id: loadingId, type: 'progress',
        text: `Retrying interrupted model file ${file} (retry ${attempt}/2)…`}),
});
let engine;
self.onmessage = async ({data}) => {
    const {id, type, payload} = data;
    try {
        if (type === 'load') {
            loadingId = id;
            engine = await CreateMLCEngine(payload.model, {
                appConfig: {...prebuiltAppConfig, cacheBackend: 'indexeddb'},
                initProgressCallback: report => self.postMessage({id, type: 'progress', text: report.text,
                    progress: report.progress}),
            });
            self.postMessage({id, type: 'result', value: true});
        } else if (type === 'generate' && engine) {
            const response = await engine.chat.completions.create({
                messages: payload.messages,
                temperature: 0.7, max_tokens: 1100,
                response_format: {type: 'json_object', schema: JSON.stringify(memoStorySchema(payload.cueCount))},
            });
            if (response.choices[0]?.finish_reason !== 'stop') throw Object.assign(
                new Error(`Model finish reason: ${response.choices[0]?.finish_reason || 'missing'}`),
                {code: response.choices[0]?.finish_reason === 'length' ? 'response_limit' : 'generation_failure'});
            self.postMessage({id, type: 'result', value: response.choices[0].message.content});
        } else throw new Error('Model is not loaded');
    } catch (error) {
        if (type !== 'load') {
            self.postMessage({id, type: 'error', ...memoGenerationError(error)});
            return;
        }
        self.postMessage({id, type: 'error', detail: String(error?.message || error), text: type === 'load'
            ? (/network|fetch|cache.add|model asset/i.test(String(error?.message || error))
                ? 'Model files could not be downloaded. Check your connection to the model host, then retry.'
                : 'The model could not load. Check available GPU memory, then retry.')
            : 'Browser AI failed while generating. Please retry.'});
    }
};
