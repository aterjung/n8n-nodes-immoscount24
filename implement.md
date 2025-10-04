
# Immobilienscout24 Node für n8n

## Aufgabenbeschreibung

In diesem Verzeichnis liegt ein n8n-node Beispiel. Dieses Beispielprojekt soll umgebaut werden, so dass es eine Anbindung an immobilienscout24.de ermöglicht. Das Node soll folgende Funktionalitäten bieten:

1. Abrufen der eigenen Inserate von immobilienscout24.de
2. Abrufen der Nachrichten/Konversationen zu einem bestimmten Inserat

Im Folgenden einige Informationen und beispiele, wie die API-Anbindung funktioniert. Passe den vorhanden Typescript code bitte so an, das die Beispiele passend umgesetzt werden.

### Credentials-Datei

Erstellen wir eine Datei für die Authentifizierung:

```javascript
// credentials/Immobilienscout24Api.credentials.js
const { NodePropertyTypes } = require('n8n-workflow');

class Immobilienscout24Api {
  constructor() {
    this.name = 'immobilienscout24Api';
    this.displayName = 'Immobilienscout24 API';
    this.documentationUrl = '';
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
        default: '',
        description: 'Der XSRF-COMMUNICATION-MGR-TOKEN aus den Cookies',
      },
    ];
  }
}

module.exports = { Immobilienscout24Api };
```

### Hilfsfunktionen

```javascript
// nodes/Immobilienscout24/GenericFunctions.js
const axios = require('axios');

async function immobilienscout24ApiRequest(method, endpoint, body = {}, query = {}) {
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
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.message;
      throw new Error(`Immobilienscout24 API error: ${errorMessage}`);
    }
    throw error;
  }
}

module.exports = { immobilienscout24ApiRequest };
```

### Node-Implementierung

```javascript
// nodes/Immobilienscout24/Immobilienscout24.node.js
const { immobilienscout24ApiRequest } = require('./GenericFunctions');

class Immobilienscout24 {
  constructor() {
    this.description = {
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
              name: 'Get All',
              value: 'getAll',
              description: 'Alle Inserate abrufen',
              action: 'Get all exposes',
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
              name: 'Get All',
              value: 'getAll',
              description: 'Alle Konversationen zu einem Inserat abrufen',
              action: 'Get all conversations',
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
              description: 'Filter nach Tags (z.B. inbox)',
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
              description: 'Priorisierung von Plus-Nutzern',
            },
          ],
        },
      ],
    };
  }

  async execute() {
    const items = this.getInputData();
    const returnData = [];

    const resource = this.getNodeParameter('resource', 0);
    const operation = this.getNodeParameter('operation', 0);

    let responseData;

    for (let i = 0; i < items.length; i++) {
      try {
        if (resource === 'expose') {
          if (operation === 'getAll') {
            const additionalFields = this.getNodeParameter('additionalFields', i);

            const page = additionalFields.page || 0;
            const size = additionalFields.size || 6;
            const sort = additionalFields.sort || 'desc';

            responseData = await immobilienscout24ApiRequest.call(
              this,
              'GET',
              `/nachrichten-manager/api/expose`,
              {},
              {
                page,
                size,
                sort,
              },
            );
          }
        } else if (resource === 'conversation') {
          if (operation === 'getAll') {
            const referenceId = this.getNodeParameter('referenceId', i);
            const additionalFields = this.getNodeParameter('additionalFields', i);

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

module.exports = { Immobilienscout24 };
```

## Anleitung zur Verwendung

1. **Installation des Nodes**:
    - Klone das Repository
    - Führe `npm install` aus, um die Abhängigkeiten zu installieren
    - Führe `npm run build` aus, um die Icons zu erstellen

2. **Einrichtung in n8n**:
    - Kopiere den Node in den n8n-Ordner oder installiere ihn als Community-Node
    - Starte n8n neu

3. **Authentifizierung einrichten**:
    - Melde dich bei Immobilienscout24 an
    - Öffne die Entwicklertools deines Browsers (F12)
    - Gehe zum Tab "Network" und lade die Seite neu
    - Finde eine Anfrage an immobilienscout24.de
    - Kopiere den kompletten Cookie-String aus den Request-Headers
    - Finde den XSRF-COMMUNICATION-MGR-TOKEN in den Cookies
    - Erstelle neue Zugangsdaten in n8n und füge diese Werte ein

4. **Verwendung des Nodes**:
    - Füge den Immobilienscout24-Node zu deinem Workflow hinzu
    - Wähle die entsprechende Ressource und Operation aus
    - Konfiguriere die Parameter nach Bedarf
    - Verbinde den Node mit anderen Nodes in deinem Workflow

## Hinweise

- Die Authentifizierung erfolgt über Cookies, die aus dem Browser kopiert werden müssen. Dies ist nicht die sicherste Methode, aber die einzige, die ohne offizielle API-Dokumentation möglich ist.
- Die Cookies haben eine begrenzte Gültigkeitsdauer und müssen regelmäßig aktualisiert werden.
- Diese Implementierung basiert auf der Analyse der API-Aufrufe und kann sich ändern, wenn Immobilienscout24 seine API ändert.
