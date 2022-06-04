export interface BugInterface {
	bug_type: string
	qualifier: string
	severity: string
	line: number
	column: number
	procedure: string
  procedure_start_line: number
	bug_type_hum: string
}

export interface FileInterface {
	filename: string
	bug: string
}

export interface DiagnosticsRes {
	files: FileInterface[]
}