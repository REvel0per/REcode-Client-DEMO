import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic } from 'vscode-languageserver';
import { bugDiagnosticProducer } from './bug';
import { BugInterface, DiagnosticsRes, LintInterface, LintRes } from './interface';
import { lintDiagnosticProducer } from './lint';

export function parseDiagnostic(bugs: BugInterface[]): Diagnostic[] {
	const diagnostics: Diagnostic[] = [];
	bugs.forEach((bug: BugInterface) => {
		diagnostics.push(bugDiagnosticProducer(bug));
	});
	return diagnostics; 
}

// export function parseLint(textdocument: TextDocument, responce: LintRes): Diagnostic[] {
// 	console.log('parseLint called');
// 	const diagnostics: Diagnostic[] = [];
// 	const files = responce.files;
// 	files.forEach(file => {
// 		const lints = file.lint;
// 		lints.forEach((lint: LintInterface) => {
// 			diagnostics.push(lintDiagnosticProducer(textdocument, lint));
// 		});
// 	});
// 	console.log(diagnostics);
// 	return diagnostics; 
// }