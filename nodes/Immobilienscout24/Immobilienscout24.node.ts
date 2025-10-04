import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { immobilienscout24ApiRequest } from './GenericFunctions';

export class Immobilienscout24 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Immobilienscout24',
		name: 'immobilienscout24',
		icon: 'file:immobilienscout24.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interagiere mit der Immobilienscout24 API',
		defaults: {
			name: 'Immobilienscout24',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'immobilienscout24Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Expose',
						value: 'expose',
					},
					{
						name: 'Conversation',
						value: 'conversation',
					},
				],
				default: 'expose',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'expose',
						],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Alle Inserate abrufen',
						action: 'Get many exposes',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Details eines Inserats abrufen',
						action: 'Get expose details',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'conversation',
						],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Alle Konversationen zu einem Inserat abrufen',
						action: 'Get many conversations',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Eine spezifische Konversation abrufen',
						action: 'Get a specific conversation',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Reference ID',
				name: 'referenceId',
				type: 'string',
				required: true,
				default: '',
				description: 'Die ID des Inserats',
				displayOptions: {
					show: {
						resource: [
							'conversation',
						],
						operation: [
							'getAll',
						],
					},
				},
			},
			{
				displayName: 'Reference ID',
				name: 'referenceId',
				type: 'string',
				required: true,
				default: '',
				description: 'Die ID des Inserats für das die Details abgerufen werden sollen',
				displayOptions: {
					show: {
						resource: [
							'expose',
						],
						operation: [
							'get',
						],
					},
				},
			},
			{
				displayName: 'Reference ID',
				name: 'referenceId',
				type: 'string',
				required: true,
				default: '',
				description: 'Die ID des Inserats',
				displayOptions: {
					show: {
						resource: [
							'conversation',
						],
						operation: [
							'get',
						],
					},
				},
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				required: true,
				default: '',
				description: 'Die ID der Konversation',
				displayOptions: {
					show: {
						resource: [
							'conversation',
						],
						operation: [
							'get',
						],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'expose',
						],
						operation: [
							'getAll',
						],
					},
				},
				options: [
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 0,
						description: 'Seitennummer für Pagination',
					},
					{
						displayName: 'Size',
						name: 'size',
						type: 'number',
						default: 6,
						description: 'Anzahl der Ergebnisse pro Seite',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'options',
						options: [
							{
								name: 'Ascending',
								value: 'asc',
							},
							{
								name: 'Descending',
								value: 'desc',
							},
						],
						default: 'desc',
						description: 'Sortierreihenfolge',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'conversation',
						],
						operation: [
							'getAll',
						],
					},
				},
				options: [
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: 'inbox',
						description: 'Filter nach Tags (z.B. inbox).',
					},
					{
						displayName: 'Size',
						name: 'size',
						type: 'number',
						default: 10,
						description: 'Anzahl der Ergebnisse pro Seite',
					},
					{
						displayName: 'Plus User Priority',
						name: 'plusUserPriority',
						type: 'boolean',
						default: true,
						description: 'Whether to prioritize Plus users',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'expose') {
					if (operation === 'getAll') {
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							page?: number;
							size?: number;
							sort?: string;
						};

						const page = additionalFields.page || 0;
						const size = additionalFields.size || 6;
						const sort = additionalFields.sort || 'desc';

						responseData = await immobilienscout24ApiRequest.call(
							this,
							'GET',
							'/nachrichten-manager/api/expose',
							{},
							{
								page,
								size,
								sort,
							},
						);
					} else if (operation === 'get') {
						const referenceId = this.getNodeParameter('referenceId', i) as string;

						responseData = await immobilienscout24ApiRequest.call(
							this,
							'GET',
							`/scoutmanager/inserieren/api/realEstate/${referenceId}`,
							{},
							{},
						);
					}
				} else if (resource === 'conversation') {
					if (operation === 'getAll') {
						const referenceId = this.getNodeParameter('referenceId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							tags?: string;
							size?: number;
							plusUserPriority?: boolean;
						};

						const tags = additionalFields.tags || 'inbox';
						const size = additionalFields.size || 10;
						const plusUserPriority = additionalFields.plusUserPriority !== false;

						responseData = await immobilienscout24ApiRequest.call(
							this,
							'GET',
							`/nachrichten-manager/api/references/${referenceId}/conversations`,
							{},
							{
								tags,
								size,
								plusUserPriority: plusUserPriority ? 'true' : 'false',
							},
						);
					} else if (operation === 'get') {
						const referenceId = this.getNodeParameter('referenceId', i) as string;
						const conversationId = this.getNodeParameter('conversationId', i) as string;

						responseData = await immobilienscout24ApiRequest.call(
							this,
							'GET',
							`/nachrichten-manager/api/references/${referenceId}/conversations/${conversationId}`,
							{},
							{},
						);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
