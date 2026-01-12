const tmdbService = require('../services/tmdbService');
const llmService = require('../services/llmService');
const Chat = require('../models/Chat');

const GENRES = {
    action: 28,
    comedy: 35,
    drama: 18,
    horror: 27,
    romance: 10749,
    thriller: 53,
    sci: 878,
    scifi: 878,
    animation: 16
};

// ===============================
// POST /api/chat/message
// ===============================
async function processMessage(req, res) {
    const { userSessionId, message, platform } = req.body;

    if (!userSessionId || !message) {
        return res.status(400).json({ error: 'Missing userSessionId or message' });
    }

    try {
        const lowerMsg = message.toLowerCase();
        const movieKeywords = ['movie', 'film', 'show', 'series', 'recommend'];
        const isMovieRequest = movieKeywords.some(k => lowerMsg.includes(k));

        // ===============================
        // NORMAL CHAT
        // ===============================
        if (!isMovieRequest) {
            const ai = await llmService.queryLocalLLM(message, "chat");
            return res.json({
                text: ai?.text || "Hello! How can I help you today?",
                movies: []
            });
        }

        // ===============================
        // MOVIE REQUEST
        // ===============================

        // 1️⃣ Determine platform provider
        let providerId = null;
        let region = 'US';
        const p = (platform || '').toLowerCase();
        if (p === 'netflix') providerId = 8;
        else if (p === 'prime') { providerId = 9; region = 'IN'; }
        else if (p === 'hotstar') { providerId = 337; region = 'IN'; }

        // 2️⃣ Smart genre extraction (hybrid approach)
        let extractedGenres = [];
        const genreKeywords = {
            action: ['action', 'fight', 'fighting', 'battle', 'explosion', 'adventure', 'superhero', 'hero', 'combat', 'war'],
            comedy: ['comedy', 'funny', 'laugh', 'humor', 'hilarious', 'comic', 'joke', 'lighthearted', 'fun'],
            drama: ['drama', 'emotional', 'serious', 'touching', 'sad', 'tear', 'moving', 'deep'],
            horror: ['horror', 'scary', 'terror', 'frightening', 'creepy', 'spooky', 'ghost', 'zombie', 'monster'],
            romance: ['romance', 'love', 'romantic', 'relationship', 'dating', 'couple', 'heart'],
            thriller: ['thriller', 'suspense', 'mystery', 'tense', 'detective', 'crime', 'investigation'],
            sci: ['sci-fi', 'science fiction', 'space', 'future', 'alien', 'robot', 'time travel', 'dystopia'],
            scifi: ['sci-fi', 'science fiction', 'space', 'future', 'alien', 'robot', 'time travel', 'dystopia'],
            animation: ['animation', 'animated', 'cartoon', 'anime', 'pixar', 'disney']
        };

        // Enhanced keyword matching with scoring
        const genreScores = {};
        for (const [genre, keywords] of Object.entries(genreKeywords)) {
            const matches = keywords.filter(k => lowerMsg.includes(k)).length;
            if (matches > 0) {
                genreScores[genre] = matches;
            }
        }

        // Sort by score and take top 2
        extractedGenres = Object.entries(genreScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([genre]) => genre);

        // If no genres found, use LLM as fallback (only when necessary)
        if (extractedGenres.length === 0) {
            console.log('⚠️ No keywords matched, using LLM fallback...');
            const genrePrompt = `Extract 1-2 movie genres from: "${message}"\nReply ONLY with genre names separated by comma (e.g., "action, thriller")`;

            try {
                const genreAI = await llmService.queryLocalLLM(genrePrompt, "chat");
                const genreText = genreAI.text.toLowerCase();

                // Parse LLM response
                for (const genre of Object.keys(GENRES)) {
                    if (genreText.includes(genre)) {
                        extractedGenres.push(genre);
                    }
                }
                extractedGenres = extractedGenres.slice(0, 2);
            } catch (err) {
                console.log('⚠️ LLM fallback failed, using popular movies');
            }
        }

        // Map genres to TMDB IDs
        const genreIds = extractedGenres.map(g => GENRES[g.toLowerCase()]).filter(Boolean);

        console.log(`🎬 Detected genres: ${extractedGenres.join(', ')} (IDs: ${genreIds.join(', ')})`);

        // 3️⃣ Fetch movies from TMDB (accurate)
        let movies = [];
        try {
            if (genreIds.length > 0) {
                movies = await tmdbService.discoverMoviesByGenre(
                    genreIds,
                    providerId,
                    region,
                    'popularity.desc'
                );
                console.log(`✅ Found ${movies.length} movies for genres: ${extractedGenres.join(', ')}`);
            } else {
                movies = await tmdbService.getPopularMovies(); // fallback
                console.log(`✅ Using popular movies (no genre match)`);
            }
        } catch (err) {
            console.error('❌ TMDB fetch error:', err.message);
            movies = [];
        }

        // 4️⃣ Prepare top 5 movies
        const topMovies = movies.slice(0, 5).map(m => ({
            id: m.id,
            title: m.title,
            overview: m.overview,
            poster_path: m.poster_path
                ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
                : null,
            vote_average: m.vote_average,
            release_date: m.release_date
        }));

        // 5️⃣ Send response immediately (no LLM delay for intro)
        res.json({
            text: "Here are some great movies for you! 🎬",
            movies: topMovies
        });

    } catch (err) {
        console.error('❌ processMessage error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
}

// ===============================
// GET /api/chat/history/:userSessionId
// ===============================
async function getHistory(req, res) {
    const { userSessionId } = req.params;

    try {
        const chat = await Chat.findOne({ userSessionId });
        res.json(chat ? chat.messages : []);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
}

// ✅ EXPORT BOTH
module.exports = {
    processMessage,
    getHistory
};
