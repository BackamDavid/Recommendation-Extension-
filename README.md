# Universal OTT Movie Recommendation Chatbot

A powerful, context-aware movie recommendation system that integrates directly into your favorite streaming platforms (Netflix, Prime, Hotstar). Powered by a Local LLM for natural conversations and TMDB for real-time movie data.

## 🏗 Architecture

The system consists of three main components:
1.  **Frontend (Extension)**: A React-based Chrome extension that injects a chat UI into OTT websites using a Shadow DOM.
2.  **Middleware (Backend)**: A Node.js/Express server that orchestrates logic between the user, the LLM, and the TMDB API.
3.  **Local LLM (Brain)**: A FastAPI server running a HuggingFace model locally for privacy-focused, natural language processing.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js** (v16+)
- **Python** (3.9+)
- **MongoDB** (running locally or a URI)
- **TMDB API Key** (Get one from [TMDB](https://www.themoviedb.org/documentation/api))

### 2. Local LLM Setup
The LLM server provides natural language responses and helps with genre extraction.

1.  Navigate to the `llm` folder:
    ```sh
    cd llm
    ```
2.  Create a virtual environment and install dependencies:
    ```sh
    python -m venv env
    source env/bin/activate  # On Windows use `env\Scripts\activate`
    pip install fastapi uvicorn transformers torch pydantic
    ```
3.  Ensure your model is placed in `llm/friend/` or update `MODEL_PATH` in `server.py`.
4.  Start the LLM server:
    ```sh
    uvicorn server:app --host 127.0.0.1 --port 11434
    ```

### 3. Backend Setup
The backend handles the chat logic, maintains history, and communicates with TMDB and the LLM.

1.  Navigate to the `backend` folder:
    ```sh
    cd backend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Configure Environment:
    Create/Edit `.env`:
    ```env
    PORT=5001
    TMDB_API_KEY=your_key_here
    MONGO_URI=your_mongodb_uri
    ```
4.  Start the server:
    ```sh
    npm run dev
    ```
    Server runs on `http://localhost:5001`.

### 4. Extension Setup
1.  Navigate to the `extension` folder:
    ```sh
    cd extension
    ```
2.  Install & Build:
    ```sh
    npm install
    npm run build
    ```
3.  **Load in Chrome**:
    - Open `chrome://extensions/`.
    - Enable **Developer mode**.
    - Click **Load unpacked** and select the `extension/dist` folder.

---

## 🛠 Features

-   **Shadow DOM Isolation**: UI styles won't break the host OTT website.
-   **Local AI**: High privacy; chat logic runs on your local machine.
-   **Smart Context Detection**: Automatically identifies if you are on Netflix, Prime, or Hotstar and adjusts recommendations.
-   **Hybrid Search**: Uses keyword matching for speed and LLM fallback for complex queries.

## 🔮 Future Improvements
-   **Authentication**: Add User Login to save preferences across devices.
-   **Advanced Context Detection**: Support for more deep-linking and specific show detection.
-   **Model Quantization**: Optimize the LLM server for lower RAM usage (e.g., GGUF support).
