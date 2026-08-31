<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube premium</title>

<!-- ========================================================================= -->
<!-- 1. STYLES & LAYOUT (CSS)                                                 -->
<!-- ========================================================================= -->
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            background-color: #0f0f0f;
            color: #fff;
            padding: 20px;
        }

        .search-container {
            position: relative;
            max-width: 600px;
            margin: 0 auto 30px auto;
        }

        .search-box {
            display: flex;
            gap: 10px;
        }

        input[type="text"] {
            width: 100%;
            padding: 12px 16px;
            font-size: 16px;
            border: 1px solid #303030;
            border-radius: 20px;
            background-color: #121212;
            color: #fff;
            outline: none;
        }

        input[type="text"]:focus {
            border-color: #1c62b9;
        }

        .suggestions-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #212121;
            border-radius: 12px;
            margin-top: 5px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            display: none;
            z-index: 1000;
            overflow: hidden;
        }

        .suggestion-item {
            padding: 10px 16px;
            cursor: pointer;
            border-bottom: 1px solid #303030;
        }

        .suggestion-item:last-child {
            border-bottom: none;
        }

        .suggestion-item:hover {
            background-color: #383838;
        }

        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .video-card {
            background-color: #181818;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .video-card:hover {
            transform: scale(1.03);
        }

        .video-card img {
            width: 100%;
            height: 140px;
            object-fit: cover;
        }

        .video-card h3 {
            font-size: 14px;
            padding: 10px;
            line-height: 1.4;
            color: #f1f1f1;
        }
    </style>
</head>
<body>

<!-- ========================================================================= -->
<!-- 2. USER INTERFACE & SEARCH ELEMENTS (HTML)                                -->
<!-- ========================================================================= -->
    <div class="search-container">
        <div class="search-box">
            <input type="text" id="search-input" placeholder="Search YouTube..." autocomplete="off">
        </div>
        <div id="suggestions-box" class="suggestions-dropdown"></div>
    </div>

    <div id="results-container" class="results-grid"></div>

<!-- ========================================================================= -->
<!-- 3. CONFIGURATION & KEYS (CONFIG)                                         -->
<!-- ========================================================================= -->
    <script>
        const CONFIG = {
            // Your API Key integrated directly
            YOUTUBE_API_KEY: 'AIzaSyDe5exhD_PLnqgodPRN53Nse-36uw8SuQc'
        };
    </script>

<!-- ========================================================================= -->
<!-- 4. API FETCHING LOGIC (API ENGINE)                                       -->
<!-- ========================================================================= -->
    <script>
        // 1. Fetch live search suggestions (Suggestions)
        async function fetchSuggestions(query) {
            if (!query.trim()) return [];

            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;

            try {
                const response = await fetch(proxyUrl + encodeURIComponent(suggestUrl));
                const data = await response.json();
                return data[1] || [];
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                return [];
            }
        }

        // 2. Fetch YouTube search results using API Key
        async function searchYouTube(query) {
            if (!query.trim()) return [];

            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&key=${CONFIG.YOUTUBE_API_KEY}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.items || [];
            } catch (error) {
                console.error("Error fetching search results:", error);
                return [];
            }
        }
    </script>

<!-- ========================================================================= -->
<!-- 5. APP INTERACTION & UI EVENTS (APP INTERACTION)                          -->
<!-- ========================================================================= -->
    <script>
        const searchInput = document.getElementById('search-input');
        const suggestionsBox = document.getElementById('suggestions-box');
        const resultsContainer = document.getElementById('results-container');

        // Listen for input and render suggestions dropdown
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value;

            if (!query.trim()) {
                suggestionsBox.style.display = 'none';
                return;
            }

            const suggestions = await fetchSuggestions(query);

            suggestionsBox.innerHTML = '';
            if (suggestions.length > 0) {
                suggestionsBox.style.display = 'block';
                suggestions.forEach(text => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = text;
                    item.onclick = () => {
                        searchInput.value = text;
                        suggestionsBox.style.display = 'none';
                        executeSearch(text);
                    };
                    suggestionsBox.appendChild(item);
                });
            } else {
                suggestionsBox.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside the search container
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                suggestionsBox.style.display = 'none';
            }
        });

        // Execute search and render video cards
        async function executeSearch(query) {
            resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Searching...</p>';
            const videos = await searchYouTube(query);

            resultsContainer.innerHTML = '';
            if (videos.length === 0) {
                resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No results found.</p>';
                return;
            }

            videos.forEach(video => {
                const title = video.snippet.title;
                const videoId = video.id.videoId;
                const thumbnail = video.snippet.thumbnails.medium.url;

                const card = document.createElement('div');
                card.className = 'video-card';
                card.innerHTML = `
                    <img src="${thumbnail}" alt="${title}">
                    <h3>${title}</h3>
                `;
                card.onclick = () => {
                    // Open in YouTube or integrate with your own Player logic
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                };
                resultsContainer.appendChild(card);
            });
        }
    </script>
</body>
</html>
