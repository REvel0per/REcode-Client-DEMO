import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { BugInterface } from './interface';

function nullptrDeref(bug: BugInterface) {
	const varName: string = bug.qualifier.split('`')[1];
	return varName ? varName.length : 1;
}

function deadStore(bug: BugInterface) {
	return bug.column-1;
}

function memLeak(bug: BugInterface) {
	return bug.bug_trace[0].column_number;
}

function resorceLeack(bug: BugInterface) {
	const fopenColumnIndex = bug.qualifier.split(' ').indexOf('column')+1;
	return Number(bug.qualifier.split(' ')[fopenColumnIndex]);
}

function unInitVal(bug: BugInterface) {
	// const varColumnIndex = bug.qualifier.split(' ').indexOf('from')+1;
	// return bug.qualifier.split(' ')[varColumnIndex].length;
	return bug.column-1;
}

function stackVarAddrEsc(bug: BugInterface) {
	return bug.column-1;
}

export function bugDiagnosticProducer(bug: BugInterface) {
	let varLength = 1;
	if (bug.bug_type === 'NULL_DEREFERENCE') {
		varLength = nullptrDeref(bug)+1;
	} else if (bug.bug_type === 'DEAD_STORE') {
		varLength = deadStore(bug);
		bug.column = 1;
	} else if (bug.bug_type === 'MEMORY_LEAK') {
		bug.column = memLeak(bug);
		varLength = 6;
	} else if (bug.bug_type === 'RESOURCE_LEAK') {
		bug.column = resorceLeack(bug);
		varLength = 5;
	} else if (bug.bug_type === 'UNINITIALIZED_VALUE') {
		varLength = unInitVal(bug);
		bug.column = 1;
	} else if (bug.bug_type === 'STACK_VARIABLE_ADDRESS_ESCAPE') {
		varLength = stackVarAddrEsc(bug);
		bug.column = 1;
	}
	const diagnostic: Diagnostic = {
		range: {
			start: { 
				line: bug.line-1,
				character: bug.column-1
			},
			end: { 
				line: bug.line-1,
				character: bug.column+varLength-1
			}
		},
		message: `[${bug.bug_type_hum}] ` + bug.qualifier
	};
	if (bug.severity === 'ERROR') {
		diagnostic.severity = DiagnosticSeverity.Warning;
	} else if (bug.severity === 'WARNING') {
		diagnostic.severity = DiagnosticSeverity.Warning;
	}
	return diagnostic;
}