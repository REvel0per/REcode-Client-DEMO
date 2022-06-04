import { assert } from 'console';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { BugInterface, DiagnosticsRes } from './interface';

export function parseDiagnostic(responce: DiagnosticsRes): Diagnostic[] {
	const diagnostics: Diagnostic[] = [];
	const files = responce.files;
	files.forEach(file => {
		const name: string = file.filename;
		const bugs = JSON.parse(file.bug);
		console.log(bugs);
		bugs.forEach((bug: BugInterface) => {
			const varName: string = bug.qualifier.split('`')[1];
			const varLength = varName ? varName.length : 0;
			const diagnostic: Diagnostic = {
				range: {
					start: { 
						line: bug.line-1,
						character: bug.column
					},
					end: { 
						line: bug.line-1,
						character: bug.column+varLength
					}
				},
				message: `[${bug.bug_type_hum}] ` + bug.qualifier
			};
			if (bug.severity === 'ERROR') {
				diagnostic.severity = DiagnosticSeverity.Error;
			} else if (bug.severity === 'WARNING') {
				diagnostic.severity = DiagnosticSeverity.Warning;
			}

			diagnostics.push(diagnostic);
		});
	});
	return diagnostics; 
}