import fetch from 'node-fetch';
import FormData = require('form-data');
import * as fs from 'fs';
import * as StreamZip from 'node-stream-zip';
import { promisify } from 'util';

export async function postFile<T>(url: string, documentName: string, filePath: string): Promise<T> {
	const body = new FormData();
	// TODO
	// 1. 파일 타입 받아오기
	// 2. 파일 이름 받아오기
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	
	// const file = await fs.createReadStream(filePath, 'utf8');
	// const createReadStream = promisify(fs.createReadStream);
	const file = new StreamZip.async({ file: filePath });
	console.log(typeof file);
	const data = 

	body.append("name", documentName);
	body.append("file", file);
	console.log("postFile called");
	console.log(body);
	return fetch(
		url,
		{
			method: "POST",
			body: body
		}
	).then(response => {
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		return response.json() as Promise<T>;
	});
}

export async function postProject<T>(url: string, projectName: string, file: Buffer): Promise<T> {
	const body = new FormData();
	// TODO
	// 1. 파일 타입 받아오기
	// 2. 파일 이름 받아오기
	body.append("name", projectName);
	body.append("file", file, { filename: projectName });
	console.log("postProject called");
	return fetch(
		url,
		{
			method: "POST",
			body: body,
		}
	).then(response => {
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		return response.json() as Promise<T>;
	});
}

export async function getDiagnoticsTest<T>(url: string): Promise<T> {
	console.log("getDiagnoticsTest called");
	return fetch(url).then(response => {
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		return response.json() as Promise<T>;
	});
}
