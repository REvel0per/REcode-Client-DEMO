import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { DiagnosticsRes } from './interface';

export function parseDiagnostic(responce: DiagnosticsRes): Diagnostic[] {
	const diagnostics: Diagnostic[] = [];
	const files = responce.files;
	files.forEach(file => {
		const name: string = file.filename;
		const bugs = file.bug;
		bugs.forEach(bug => {
			const diagnostic: Diagnostic = {
				range: {
					start: { 
						line: bug.line,
						character: bug.column
					},
					end: { 
						line: bug.line,
						character: bug.column+1
					}
				},
				message: `[${bug.bug_type}]` + bug.qualifier
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