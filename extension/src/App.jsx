import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MessageCircle, X, Send } from 'lucide-react'; // Make sure to install lucide-react

const API_URL = 'http://localhost:5001/api/chat/message';

const App = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I can recommend movies for you. Watching something interesting?' }
    ]);
    const [input, setInput] = useState('');
    const [sessionId] = useState(uuidv4());
    const messagesEndRef = useRef(null);
    const [contextMovie, setContextMovie] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Attempt to detect movie on open
    useEffect(() => {
        if (isOpen) {
            // This runs in the content script context
            // Try to grab title from the window helper we defined or standard DOM
            let title = document.title;
            // Basic cleanup for Netflix/Prime
            if (title.includes(' - Netflix')) title = title.split(' - Netflix')[0];
            if (title.includes('Prime Video: ')) title = title.split('Prime Video: ')[0];
            setContextMovie(title);
        }
    }, [isOpen]);

    const [platform, setPlatform] = useState('all');

    useEffect(() => {
        const hostname = window.location.hostname;
        if (hostname.includes('netflix')) setPlatform('netflix');
        else if (hostname.includes('amazon') || hostname.includes('prime')) setPlatform('prime');
        else if (hostname.includes('disney')) setPlatform('disney');
        else if (hostname.includes('hulu')) setPlatform('hulu');
        else if (hostname.includes('apple') || hostname.includes('tv.apple')) setPlatform('apple');
        else if (hostname.includes('max') || hostname.includes('hbo')) setPlatform('max');
        else if (hostname.includes('peacock')) setPlatform('peacock');
        else if (hostname.includes('paramount')) setPlatform('paramount');
        else if (hostname.includes('hotstar')) setPlatform('hotstar');
        else if (hostname.includes('jiocinema') || hostname.includes('jio')) setPlatform('jio');
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        try {
            const payload = {
                userSessionId: sessionId,
                message: userMsg.text,
                contextMovie: contextMovie,
                platform: platform // Send detected platform from state
            };

            const res = await axios.post(API_URL, payload);
            const botMsg = {
                sender: 'bot',
                text: res.data.text,
                movies: res.data.movies
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I had trouble reaching the server.' }]);
        }
    };

    if (!isOpen) {
        return (
            <div className={`fab theme-${platform}`} onClick={() => setIsOpen(true)}>
                <MessageCircle size={32} color="white" />
            </div>
        );
    }

    return (
        <div className={`chat-container theme-${platform}`}>
            <div className="chat-header">
                <span>Movie Assistant</span>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
            </div>

            <div className="chat-body">
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className={`message ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                            {msg.text}
                        </div>
                        {msg.movies && msg.movies.map(movie => (
                            <div
                                key={movie.id}
                                className="movie-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    const hostname = window.location.hostname;
                                    let searchUrl = '';
                                    if (hostname.includes('netflix')) {
                                        searchUrl = `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('amazon') || hostname.includes('primevideo')) {
                                        searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(movie.title)}&i=instant-video`;
                                    } else if (hostname.includes('disneyplus')) {
                                        searchUrl = `https://www.disneyplus.com/search?q=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('hulu')) {
                                        searchUrl = `https://www.hulu.com/search?q=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('apple')) {
                                        searchUrl = `https://tv.apple.com/search?term=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('max') || hostname.includes('hbo')) {
                                        searchUrl = `https://www.max.com/search?q=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('peacocktv')) {
                                        searchUrl = `https://www.peacocktv.com/search?q=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('paramountplus')) {
                                        searchUrl = `https://www.paramountplus.com/search/?q=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('hotstar')) {
                                        searchUrl = `https://www.hotstar.com/in/search?q=${encodeURIComponent(movie.title)}`;
                                    } else if (hostname.includes('jiocinema')) {
                                        searchUrl = `https://www.jiocinema.com/search?q=${encodeURIComponent(movie.title)}`;
                                    } else {
                                        // Default fallback to Google
                                        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movie.title + ' movie watch online')}`;
                                    }

                                    if (searchUrl) window.location.href = searchUrl;
                                }}
                            >
                                {movie.poster_path ? <img src={movie.poster_path} alt={movie.title} /> : <div style={{ width: 50, height: 75, background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Img</div>}
                                <div className="movie-info">
                                    <h4>{movie.title} ({movie.release_date?.split('-')[0]}) 🔗</h4>
                                    <p style={{ fontSize: '11px', color: '#ccc', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{movie.overview}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    placeholder={contextMovie ? `Discussing ${contextMovie}...` : "Ask for recommendations..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="send-btn" onClick={sendMessage}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

export default App;
