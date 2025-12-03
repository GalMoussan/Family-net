import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
	req: VercelRequest,
	res: VercelResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { url } = req.body;

	if (!url) {
		return res.status(400).json({ error: 'URL is required' });
	}

	try {
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: "You are a helpful assistant that summarizes academic articles. You will be given a URL or text. Your goal is to extract a JSON object with the following fields: 'title' (string), 'summary' (string, max 3 sentences), and 'tags' (array of strings, max 3). Return ONLY the JSON object."
				},
				{
					role: "user",
					content: `Analyze this URL/Text: ${url}`
				}
			],
			model: "gpt-4o",
			response_format: { type: "json_object" },
		});

		const content = completion.choices[0].message.content;
		if (!content) {
			throw new Error("No content returned from OpenAI");
		}

		const result = JSON.parse(content);
		return res.status(200).json(result);

	} catch (error) {
		console.error("OpenAI API Error:", error);
		return res.status(500).json({ error: 'Failed to summarize article' });
	}
}
