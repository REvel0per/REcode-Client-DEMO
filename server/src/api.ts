import fetch, { BodyInit } from 'node-fetch';
import FormData = require('form-data');

export async function api<T>(url: string, encodedDocumentText: string): Promise<T> {
	const body = new FormData();
	// TODO
	// 1. 파일 타입 받아오기
	// 2. 파일 이름 받아오기
	body.append("type", "text/plain"); // 이건 옵션
	body.append("name", "TEST.txt");
	body.append("body", encodedDocumentText);
	console.log("api called");
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
