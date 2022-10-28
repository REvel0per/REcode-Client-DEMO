/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

import { postFile, postProject } from './api';
import { parseDiagnostic } from './diagnostic';



// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// Revalidate all open text documents
	// documents.all().forEach(validateTextDocument);
});

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	// getTextDocumentLint(change.document);
});

async function getTextDocumentDiagnostic(textDocument: TextDocument): Promise<void> {
	const start = new Date();
	console.log('getTextDocumentDiagnostic is called');
	const uri = textDocument.uri;
	const fileName = uri.split('/').pop();
	const workspacePath = uri.split("/").slice(0, -1).join("/").replace("file://", "");
	const workspaceName = String(workspacePath.split("/").at(-1));
	
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const execSync = require('child_process').execSync;
	const zipCommand = `cd ${workspacePath} && zip -r ${workspaceName}.zip ./*`;
	execSync(zipCommand);
	const zipFilePath = `${workspacePath}/${workspaceName}.zip`;
	
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const fs = require('fs');
	const zipFile = fs.readFileSync(zipFilePath, 'binary');
	const buffer = Buffer.from(zipFile, 'binary');
	
	const end = new Date();
	execSync(`echo "zip time: ${end.getTime() - start.getTime()}" >> ${workspacePath}/log/${fileName}.txt`);
	console.log('zip time: %d mil-sec', end.getTime() - start.getTime());
	
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const WebSocket = require('ws');
	const ws = new WebSocket('ws://localhost:2020');
	ws.onopen = function () {
		console.log('connected');
		ws.send(buffer);
	};
	ws.onmessage = function (event: any) {
		const start = new Date();
		// Receive JSON data from server
		const data = JSON.parse(event.data);
		const files = data.files;
		files.forEach((file: any) => {
			const filePath = `${workspacePath}/${file.filename}`;
			const diagnostics: Diagnostic[] = parseDiagnostic(file.bugs);
			connection.sendDiagnostics({ uri: filePath, diagnostics });
		});
		const end = new Date();
		execSync(`echo "visualization time: ${end.getTime() - start.getTime()}" >> ${workspacePath}/log/${fileName}.txt`);
		console.log('visualization time: %d mil-sec', end.getTime() - start.getTime());
	};
	ws.onclose = function (event: any) {
		console.log('disconnected');
	};
	ws.onerror = function (error: any) {
		console.log(error);
	};
}

// async function getTextDocumentLint(textDocument: TextDocument): Promise<void> {
// 	const url = 'http://localhost:2020/norm';
// 	console.log('getTextDocumentLint is called');
// 	const documentName = String(textDocument.uri.split("/").at(-1));
// 	const documentText = textDocument.getText();

// 	const response = await postFile<Response>(url, documentName, documentText)
// 	.then(({ ok, status, body }) => {
// 		displayLintDiagnostic(textDocument, body);
// 	});
// }

// async function displayLintDiagnostic(textDocument: TextDocument, responce: any): Promise<void> {
// 	console.log('displayLintDiagnostic called');
// 	const diagnostics: Diagnostic[] = parseLint(textDocument, responce);
// 	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
// }

documents.onDidSave(change => {
	getTextDocumentDiagnostic(change.document);
});

// async function validateTextDocument(textDocument: TextDocument): Promise<void> {
// 	// In this simple example we get the settings for every validate run.
// 	const settings = await getDocumentSettings(textDocument.uri);
// 	console.log('validateTextDocument called');
// 	// The validator creates diagnostics for all uppercase words length 2 and more
// 	const text = textDocument.getText();
// 	const pattern = /\b[A-Z]{2,}\b/g;
// 	let m: RegExpExecArray | null;

// 	let problems = 0;
// 	const diagnostics: Diagnostic[] = [];
// 	while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
// 		problems++;
// 		const diagnostic: Diagnostic = {
// 			severity: DiagnosticSeverity.Warning,
// 			range: {
// 				start: textDocument.positionAt(m.index),
// 				end: textDocument.positionAt(m.index + m[0].length)
// 			},
// 			message: `${m[0]} is all uppercase.`,
// 			source: 'ex'
// 		};
// 		if (hasDiagnosticRelatedInformationCapability) {
// 			diagnostic.relatedInformation = [
// 				{
// 					location: {
// 						uri: textDocument.uri,
// 						range: Object.assign({}, diagnostic.range)
// 					},
// 					message: 'Spelling matters'
// 				},
// 				{
// 					location: {
// 						uri: textDocument.uri,
// 						range: Object.assign({}, diagnostic.range)
// 					},
// 					message: 'Particularly for names'
// 				}
// 			];
// 		}
// 		diagnostics.push(diagnostic);
// 	}

// 	// Send the computed diagnostics to VSCode.
// 	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
// }

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [
			{
				label: 'TypeScript',
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'JavaScript',
				kind: CompletionItemKind.Text,
				data: 2
			}
		];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
