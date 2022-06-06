export interface TraceInterface {
	level: number
  filename: string
  line_number: number
  column_number: number
  description: string
}

export interface BugInterface {
	bug_type: string
	qualifier: string
	severity: string
	line: number
	column: number
	bug_trace: TraceInterface[]
	procedure: string
  procedure_start_line: number
	bug_type_hum: string
}

export interface LintInterface {
	type: string
	line: string
	column: string
	message: string
}

export interface FileLintInterface {
	filename: string
	lint: LintInterface[]
}

export interface FileInterface {
	filename: string
	bug: BugInterface[]
	lint: LintInterface[]
}

export interface LintRes {
	files: FileLintInterface[]
}

export interface DiagnosticsRes {
	files: FileInterface[]
}