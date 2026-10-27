// The app inserts the images. The model only writes text around/between them.
export function memoStorySchema(count) {
    if (!Number.isInteger(count) || count < 1 || count > 12) throw new Error('Invalid AI image count');
    return {type: 'object', properties: {
        opening: {type: 'string', maxLength: 120},
        links: {type: 'array', minItems: count - 1, maxItems: count - 1,
            items: {type: 'string', maxLength: 220}},
        ending: {type: 'string', maxLength: 220},
        explanation: {type: 'string', maxLength: 1400},
    }, required: ['opening', 'links', 'ending', 'explanation'], additionalProperties: false};
}

export function memoGenerationError(error) {
    const detail = String(error?.message || error);
    if (error?.code === 'response_limit') return {
        code: 'response_limit', detail,
        text: 'The AI reached its response limit before finishing. This is a generation failure, not a word-count error. Please retry.',
    };
    if (/device.*lost|gpu.*lost|out of memory|allocation/i.test(detail)) return {
        code: 'gpu_failure', detail,
        text: 'The browser lost access to GPU resources while generating. Stop the model, close other GPU-heavy tabs, and retry.',
    };
    return {code: 'generation_failure', detail,
        text: 'Browser AI failed while generating the story. Please retry; your input was within the supported word limit.'};
}
