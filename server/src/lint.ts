import { Position, Range, TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { LintInterface } from './interface';

function noAgrsVoid(lint: LintInterface) {
	return -1; 
}

function forbChrName(textDocument: TextDocument, lint: LintInterface) {
	const lineNumber = Number(lint.line);
	const columnNumber = Number(lint.column);
	const start: Position = {
		line: lineNumber-1,
		character: columnNumber-1,
	};
	const end: Position = {
		line: lineNumber-1,
		character: columnNumber,
	};
	const range: Range = {
		start: start,
		end: end
	};
	const varPosition: number[] = [1, -1];
	while(textDocument.getText(range).slice(-1) !== ' ') {
		console.log(textDocument.getText(range).slice(-1));
		end.character++;
		varPosition[1]++;
	}
	while(textDocument.getText(range)[0] !== ' ') {
		console.log(textDocument.getText(range)[0]);
		start.character--;
		varPosition[0]--;
	}
	console.log(varPosition);
	return varPosition; 
}

function consecSpace(textDocument: TextDocument, lint: LintInterface) {
	const lineNumber = Number(lint.line);
	const columnNumber = Number(lint.column);
	const start: Position = {
		line: lineNumber-1,
		character: columnNumber-1,
	};
	const end: Position = {
		line: lineNumber-1,
		character: columnNumber,
	};
	const range: Range = {
		start: start,
		end: end
	};
	const varPosition: number[] = [1, -1];
	while(textDocument.getText(range).slice(-1) === ' ') {
		console.log(textDocument.getText(range).slice(-1));
		end.character++;
		varPosition[1]++;
	}
	while(textDocument.getText(range)[0] === ' ') {
		console.log(textDocument.getText(range)[0]);
		start.character--;
		varPosition[0]--;
	}
	console.log(varPosition);
	return varPosition; 
}

function consecNewLines(lint: LintInterface) {
	return 2; 
}

export function lintDiagnosticProducer(textDocument: TextDocument, lint: LintInterface) {
	console.log('lintDiagnosticProducer called');

	let lintColumnStartOffset = 0;
	let lintColumnEndOffset = 0;
	if (lint.type === 'NO_ARGS_VOID') {
		lintColumnStartOffset = noAgrsVoid(lint);
	} else if (lint.type === 'FORBIDDEN_CHAR_NAME') {
		[lintColumnStartOffset, lintColumnEndOffset] = forbChrName(textDocument, lint);
	} else if (lint.type === 'CONSECUTIVE_SPC') {
		[lintColumnStartOffset, lintColumnEndOffset] = consecSpace(textDocument, lint);
	} else if (lint.type === 'CONSECUTIVE_NEWLINES') {
		lintColumnEndOffset = consecNewLines(lint);
	}

	const diagnostic: Diagnostic = {
		range: {
			start: { 
				line: Number(lint.line)-1,
				character: Number(lint.column)+lintColumnStartOffset-1
			},
			end: { 
				line: Number(lint.line)-1,
				character: Number(lint.column)+lintColumnEndOffset
			}
		},
		message: `[${lint.type}] ` + lint.message
	};
	diagnostic.severity = DiagnosticSeverity.Information;
	return diagnostic;
}