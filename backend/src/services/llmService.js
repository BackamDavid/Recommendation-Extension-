const axios = require('axios');

const LLM_SERVER_URL = 'http://127.0.0.1:11434/query';

async function queryLocalLLM(userMessage, mode = "chat") {
    if (!userMessage || !userMessage.trim()) {
        return { text: "Please enter a valid message." };
    }

    let prompt = "";

    if (mode === "chat") {
        prompt = `You are MovieBot.
Respond naturally in ONE short sentence.
Do NOT mention movies unless asked.

User: ${userMessage}
Assistant:`;
    } else if (mode === "movies") {
        prompt = `You are MovieBot.
User wants movie recommendations.
Write ONE friendly sentence.
Do NOT list movies.

User: ${userMessage}
Assistant:`;
    } else {
        prompt = `User: ${userMessage}\nAssistant:`;
    }

    try {
        const response = await axios.post(LLM_SERVER_URL, { prompt }, {
            timeout: 5000 // 5 second timeout for faster failure
        });

        let text = response?.data?.text?.trim() || "I'm not sure how to respond.";

        // ===== Clean up repeated instructions or multiple User/Assistant blocks =====
        if (text.includes("Assistant:")) {
            text = text.split("Assistant:").pop().trim();
        }

        // Replace newlines with spaces and remove excessive whitespace
        text = text.replace(/\n+/g, " ").trim();

        return { text };

    } catch (err) {
        console.error("⚠️ LLM error:", err.message);
        return { text: "Sorry, the AI service is currently unavailable." };
    }
}

module.exports = { queryLocalLLM };
