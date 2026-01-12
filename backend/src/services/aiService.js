const axios = require('axios');

const LOCAL_MODEL_API = 'http://127.0.0.1:11434/api/generate';

exports.analyzeIntent = async (message, contextMovie, platform) => {
    const systemPrompt = `
You are a helpful assistant. Respond naturally for chat, or JSON for movies.
Context: Movie=${contextMovie || 'None'}, Platform=${platform || 'All'}
`;

    const prompt = `${systemPrompt}\nUser: ${message}`;

    const response = await axios.post(LOCAL_MODEL_API, { prompt });

    // Try to parse JSON; fallback to chat text
    try {
        return JSON.parse(response.data.response);
    } catch {
        return { type: "chat", reply: response.data.response };
    }
};
