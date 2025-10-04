import type { IExecuteFunctions, IHookFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import axios, { AxiosRequestConfig } from 'axios';

export async function immobilienscout24ApiRequest(
	this: IHookFunctions | IExecuteFunctions,
	method: string,
	endpoint: string,
	body: object = {},
	query: object = {},
): Promise<any> {
	const credentials = await this.getCredentials('immobilienscout24Api');

	const options: AxiosRequestConfig = {
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
			'x-xsrf-communication-mgr-token': credentials.xsrfToken as string,
			'Cookie': credentials.cookieString as string,
		},
	};

	if (Object.keys(query).length > 0) {
		options.params = query;
	}

	if (Object.keys(body).length > 0) {
		options.data = body;
	}

	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		if (error.response) {
			const errorMessage = error.response.data?.message || error.message;
			throw new NodeApiError(this.getNode(), error, { message: `Immobilienscout24 API error: ${errorMessage}` });
		}
		throw error;
	}
}
