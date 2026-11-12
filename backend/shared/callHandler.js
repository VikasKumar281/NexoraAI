export function callHandler(handler, { body = {}, params = {}, headers = {} } = {}) {
    return new Promise((resolve, reject) => {
        const req = { body, params, headers };
        let statusCode = 200;
        let settled = false;

        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(data) {
                if (settled) return this;
                settled = true;
                if (statusCode >= 400) {
                    const error = new Error(data?.message || "request failed");
                    error.status = statusCode;
                    error.data = data;
                    reject(error);
                } else {
                    resolve(data);
                }
                return this;
            },
        };

        Promise.resolve(handler(req, res)).catch((error) => {
            if (!settled) {
                settled = true;
                reject(error);
            }
        });
    });
}
