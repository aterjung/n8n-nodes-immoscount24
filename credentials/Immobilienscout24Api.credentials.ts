import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Immobilienscout24Api implements ICredentialType {
	name = 'immobilienscout24Api';
	displayName = 'Immobilienscout24 API';
	documentationUrl = 'https://www.immobilienscout24.de/';

	properties: INodeProperties[] = [
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
