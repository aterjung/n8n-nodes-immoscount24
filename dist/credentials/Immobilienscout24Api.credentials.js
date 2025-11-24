"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Immobilienscout24Api = void 0;
class Immobilienscout24Api {
    constructor() {
        this.name = 'immobilienscout24Api';
        this.displayName = 'Immobilienscout24 API';
        this.documentationUrl = 'https://www.immobilienscout24.de/';
        this.properties = [
            {
                displayName: 'Cookie String',
                name: 'cookieString',
                type: 'string',
                default: '',
                description: 'Der komplette Cookie-String aus dem Browser (nach Login bei Immobilienscout24)',
            },
            {
                displayName: 'XSRF Token',
                name: 'xsrfToken',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'Der XSRF-COMMUNICATION-MGR-TOKEN aus den Cookies',
            },
        ];
    }
}
exports.Immobilienscout24Api = Immobilienscout24Api;
//# sourceMappingURL=Immobilienscout24Api.credentials.js.map