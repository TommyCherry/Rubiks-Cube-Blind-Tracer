// Runs only inside the AI worker. Successful bytes are cached by WebLLM's IndexedDB backend.
// Restrict retries to public model assets; do not proxy traffic through our server.
export function createModelFetch(fetchImpl, {sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
    now = () => Date.now(), onRetry = () => {}, concurrency = 2} = {}) {
    let active = 0;
    const waiting = [];
    async function acquire() {
        if (active >= concurrency) await new Promise(resolve => waiting.push(resolve));
        else active++;
    }
    function release() {
        const next = waiting.shift();
        if (next) next(); else active--;
    }
    return async function modelFetch(input, init) {
        const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const url = new URL(raw);
        const request = input instanceof Request ? input : null;
        const method = init?.method || request?.method || 'GET';
        const headers = new Headers(init?.headers || request?.headers);
        const asset = (url.hostname === 'huggingface.co' && url.pathname.startsWith('/mlc-ai/'))
            || (url.hostname === 'raw.githubusercontent.com' && url.pathname.startsWith('/mlc-ai/binary-mlc-llm-libs/'));
        if (!asset || method !== 'GET' || headers.has('Range')) return fetchImpl(input, init);
        await acquire();
        try {
            for (let attempt = 0; attempt < 3; attempt++) {
                const target = new URL(url);
                if (attempt) target.searchParams.set('memo_retry', `${now()}-${attempt}`);
                try {
                    const options = request ? {method, headers, signal: request.signal, credentials: request.credentials, ...init} : {...init};
                    if (attempt) options.cache = 'no-store';
                    const response = await fetchImpl(target.href, options);
                    if (!response.ok || response.status === 206) {
                        const retryable = response.status === 206 || response.status === 403 || response.status === 408 || response.status === 429 || response.status >= 500;
                        await response.body?.cancel();
                        if (!retryable) throw Object.assign(new Error(`Model asset returned HTTP ${response.status}`), {permanent: true});
                        throw new Error(`Model asset download returned HTTP ${response.status}`);
                    }
                    // Read the complete body before accepting it, so mid-download disconnects
                    // are retried and partial files never reach the model cache.
                    const bytes = await response.arrayBuffer();
                    const outHeaders = new Headers(response.headers);
                    outHeaders.delete('content-encoding');
                    outHeaders.set('content-length', String(bytes.byteLength));
                    return new Response(bytes, {status: response.status, headers: outHeaders});
                } catch (error) {
                    if (error.permanent || error.name === 'AbortError' || attempt === 2) throw error;
                    onRetry(url.pathname.split('/').at(-1), attempt + 1);
                    await sleep(750 * (attempt + 1));
                }
            }
        } finally { release(); }
    };
}
