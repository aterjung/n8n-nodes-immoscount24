"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.immobilienscout24ApiRequest = immobilienscout24ApiRequest;
const n8n_workflow_1 = require("n8n-workflow");
const axios_1 = __importDefault(require("axios"));
async function immobilienscout24ApiRequest(method, endpoint, body = {}, query = {}) {
    var _a;
    const credentials = await this.getCredentials('immobilienscout24Api');
    const options = {
        method,
        url: `https://www.immobilienscout24.de${endpoint}`,
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
            'priority': 'u=1, i',
            'referer': 'https://www.immobilienscout24.de/nachrichten-manager/uebersicht',
            'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'x-xsrf-communication-mgr-token': credentials.xsrfToken,
            'Cookie': credentials.cookieString,
        },
    };
    if (Object.keys(query).length > 0) {
        options.params = query;
    }
    if (Object.keys(body).length > 0) {
        options.data = body;
    }
    try {
        const response = await axios_1.default.request(options);
        return response.data;
    }
    catch (error) {
        if (error.response) {
            const errorMessage = ((_a = error.response.data) === null || _a === void 0 ? void 0 : _a.message) || error.message;
            throw new n8n_workflow_1.NodeApiError(this.getNode(), error, { message: `Immobilienscout24 API error: ${errorMessage}` });
        }
        throw error;
    }
}
//# sourceMappingURL=GenericFunctions.js.map