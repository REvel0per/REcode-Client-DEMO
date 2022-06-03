import fetch, { BodyInit } from 'node-fetch';
import FormData = require('form-data');

export async function postFile<T>(url: string, documentName: string, encodedDocumentText: string): Promise<T> {
	const body = new FormData();
	// TODO
	// 1. 파일 타입 받아오기
	// 2. 파일 이름 받아오기
	body.append("name", documentName);
	body.append("body", encodedDocumentText);
	console.log("postFile called");
	return fetch(
		url,
		{
			method: "POST",
			body: body as BodyInit
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
