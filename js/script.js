// 🔑 YOUR GOOGLE YOUTUBE V3 API KEY
const CUSTOM_YT_KEY = "AIzaSyD4won1S7jxZsKaw4f29vo8he-fizrV2kw";

// 🔑 YOUR TMDB API KEY FOR MOVIES & TV SHOWS (Get a free one at https://www.themoviedb.org)
const TMDB_API_KEY = "YOUR_TMDB_API_KEY";

// -----------------------------------------------------------------
// 1. Sidebar Collapse / Expand Functionality
// -----------------------------------------------------------------
function initSidebarToggle() {
  const rail = document.getElementById("appRail");
  const toggleBtn = document.getElementById("railToggleBtn");

  if (!rail || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    rail.classList.toggle("collapsed");
  });
}

// -----------------------------------------------------------------
// 2. Sidebar Tab Switcher
// -----------------------------------------------------------------
function initTabs() {
  const switches = document.querySelectorAll(".rail .tool-switch");
  const panels = document.querySelectorAll("main.main .panel");

  switches.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetAttr = btn.getAttribute("data-panel");

      switches.forEach(s => s.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(`panel-${targetAttr}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}

// -----------------------------------------------------------------
// 3. YT Search & Cinema Player
// -----------------------------------------------------------------
async function runCustomYTSearch() {
  const inputVal = document.getElementById("custom-yt-query")?.value.trim();
  const gridTarget = document.getElementById("custom-yt-results");
  const labelStatus = document.getElementById("custom-yt-status");

  if (!inputVal || !gridTarget) return;

  labelStatus.innerText = "Searching YouTube library...";
  gridTarget.innerHTML = "";

  const targetEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(inputVal)}&type=video&key=${CUSTOM_YT_KEY}`;

  try {
    const apiFetch = await fetch(targetEndpoint);
    const payloadResult = await apiFetch.json();

    if (!apiFetch.ok) {
      const errMessage = payloadResult.error ? payloadResult.error.message : "Unknown Connection Failure";
      labelStatus.innerText = `Google API Error: ${errMessage}`;
      return;
    }

    labelStatus.innerText = "";

    if (!payloadResult.items || payloadResult.items.length === 0) {
      labelStatus.innerText = "No video matches found.";
      return;
    }

    payloadResult.items.forEach(videoItem => {
      if (!videoItem.id || !videoItem.snippet) return;

      const id = videoItem.id.videoId;
      if (!id) return;

      const title = videoItem.snippet.title || "No Title";
      const channelName = videoItem.snippet.channelTitle || "Unknown Channel";

      let thumbUrl = "https://via.placeholder.com/320x180?text=No+Thumbnail";
      if (videoItem.snippet.thumbnails && videoItem.snippet.thumbnails.high) {
        thumbUrl = videoItem.snippet.thumbnails.high.url;
      }

      const dynamicItem = document.createElement("div");
      dynamicItem.style.cssText = "background: #161616; border: 1px solid #222; border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.2s, border-color 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column;";

      dynamicItem.onmouseenter = () => { dynamicItem.style.borderColor = '#e2a33d'; dynamicItem.style.transform = 'translateY(-3px)'; };
      dynamicItem.onmouseleave = () => { dynamicItem.style.borderColor = '#222'; dynamicItem.style.transform = 'translateY(0)'; };

      dynamicItem.innerHTML = `
        <div style="position: relative; padding-bottom: 56.25%; background: #000; overflow: hidden;">
          <img src="${thumbUrl}" alt="Preview" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; object-fit: cover; opacity: 0.9;">
          <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.3);">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="#e2a33d"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
        <div style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-size: 0.85rem; font-weight: 600; color: #eaeaea; line-height: 1.4; max-height: 2.8em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 6px;">
            ${title}
          </div>
          <div style="font-size: 0.75rem; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${channelName}
          </div>
        </div>
      `;

      dynamicItem.onclick = function() {
        const mainPlayer = document.getElementById("custom-yt-main-player");
        if (mainPlayer) {
          mainPlayer.style.display = "block";
          mainPlayer.innerHTML = `
            <iframe style="width: 100%; height: 100%; border: 0; position: absolute; top: 0; left: 0;" 
                    src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
          `;
          mainPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      gridTarget.appendChild(dynamicItem);
    });

  } catch (err) {
    if (labelStatus) labelStatus.innerText = `Network Connection Blocked: ${err.message}`;
  }
}

// -----------------------------------------------------------------
// 4. Calculator
// -----------------------------------------------------------------
function initCalculator() {
  const display = document.getElementById("calcDisplay");
  const buttons = document.querySelectorAll("#panel-calc button");
  if (!display || !buttons.length) return;

  let currentExpr = "";

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.getAttribute("data-calc-input");
      const action = btn.getAttribute("data-calc-action");

      if (action === "clear") {
        currentExpr = "";
        display.innerText = "0";
      } else if (action === "equals") {
        try {
          const sanitized = currentExpr.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-");
          const result = Function(`'use strict'; return (${sanitized})`)();
          display.innerText = result;
          currentExpr = String(result);
        } catch {
          display.innerText = "Error";
          currentExpr = "";
        }
      } else if (input) {
        if (display.innerText === "0" || display.innerText === "Error") {
          currentExpr = input;
        } else {
          currentExpr += input;
        }
        display.innerText = currentExpr;
      }
    });
  });
}

// -----------------------------------------------------------------
// 5. Notes Engine (Auto Save)
// -----------------------------------------------------------------
function initNotes() {
  const notesArea = document.getElementById("notesArea");
  const notesStatus = document.getElementById("notesStatus");
  if (!notesArea) return;

  notesArea.value = localStorage.getItem("toolkit_notes") || "";

  notesArea.addEventListener("input", () => {
    localStorage.setItem("toolkit_notes", notesArea.value);
    notesStatus.innerText = "Saving...";
    setTimeout(() => { notesStatus.innerText = "All changes saved"; }, 400);
  });
}

// -----------------------------------------------------------------
// 6. Movies & TV Series Search + Player
// -----------------------------------------------------------------
function initMoviePlayer() {
  const movieSearchInput = document.getElementById("movieSearchInput");
  const movieTypeSelect = document.getElementById("movieTypeSelect");
  const searchMovieBtn = document.getElementById("searchMovieBtn");
  const searchResults = document.getElementById("searchResults");

  const tvControls = document.getElementById("tvControls");
  const tvSeasonInput = document.getElementById("tvSeasonInput");
  const tvEpisodeInput = document.getElementById("tvEpisodeInput");
  const updateTvBtn = document.getElementById("updateTvBtn");

  const movieIframe = document.getElementById("movieIframe");
  const serverBtns = document.querySelectorAll(".server-btn");

  if (!searchMovieBtn || !searchResults || !movieIframe) return;

  let currentTmdbId = "550"; // Default: Fight Club
  let currentMediaType = "movie";
  let currentServer = "vidsrc";

  // Server embed URL builders
  const serverUrls = {
    vidsrc: {
      movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
      tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
    autoembed: {
      movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
      tv: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
    },
    embed2: {
      movie: (id) => `https://www.2embed.cc/embed/${id}`,
      tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
    }
  };

  // Update iframe source
  function updatePlayer() {
    const season = tvSeasonInput ? (tvSeasonInput.value || 1) : 1;
    const episode = tvEpisodeInput ? (tvEpisodeInput.value || 1) : 1;

    if (serverUrls[currentServer] && serverUrls[currentServer][currentMediaType]) {
      const streamUrl = serverUrls[currentServer][currentMediaType](currentTmdbId, season, episode);
      movieIframe.src = streamUrl;
    }
  }

  // Fetch search results from TMDB API
  async function searchMedia() {
    const query = movieSearchInput.value.trim();
    const type = movieTypeSelect.value; // 'movie' or 'tv'

    if (!query) return;

    searchResults.innerHTML = `<p style="color:#888; grid-column:1/-1; text-align:center;">Searching TMDB library...</p>`;

    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        searchResults.innerHTML = `<p style="color:#e53e3e; grid-column:1/-1; text-align:center;">API Error: ${data.status_message || 'Failed to search'}</p>`;
        return;
      }

      if (!data.results || data.results.length === 0) {
        searchResults.innerHTML = `<p style="color:#888; grid-column:1/-1; text-align:center;">No results found.</p>`;
        return;
      }

      searchResults.innerHTML = "";

      // Display results grid
      data.results.slice(0, 8).forEach(item => {
        const title = item.title || item.name || "Untitled";
        const releaseYear = (item.release_date || item.first_air_date || "").split("-")[0];
        const posterUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
          : "https://via.placeholder.com/185x278?text=No+Cover";

        const card = document.createElement("div");
        card.style.cssText = "cursor: pointer; background: #161616; border: 1px solid #222; border-radius: 6px; padding: 8px; text-align: center; transition: border-color 0.2s, transform 0.2s;";

        card.onmouseenter = () => { card.style.borderColor = '#e2a33d'; card.style.transform = 'translateY(-2px)'; };
        card.onmouseleave = () => { card.style.borderColor = '#222'; card.style.transform = 'translateY(0)'; };

        card.innerHTML = `
          <img src="${posterUrl}" alt="${title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px;">
          <div style="font-size: 0.85rem; font-weight: 600; color: #eaeaea; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
          <div style="font-size: 0.75rem; color: #888;">${releaseYear}</div>
        `;

        card.addEventListener("click", () => {
          currentTmdbId = item.id;
          currentMediaType = type;

          if (tvControls) {
            tvControls.style.display = (type === "tv") ? "flex" : "none";
          }

          updatePlayer();
          movieIframe.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        searchResults.appendChild(card);
      });

    } catch (err) {
      searchResults.innerHTML = `<p style="color:#e53e3e; grid-column:1/-1; text-align:center;">Network Error: ${err.message}</p>`;
    }
  }

  // Event Listeners for Movies
  searchMovieBtn.addEventListener("click", searchMedia);

  movieSearchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") searchMedia();
  });

  if (updateTvBtn) {
    updateTvBtn.addEventListener("click", updatePlayer);
  }

  // Server Switcher Buttons
  serverBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      serverBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentServer = btn.dataset.server;
      updatePlayer();
    });
  });
}

// -----------------------------------------------------------------
// 7. Application Initialization
// -----------------------------------------------------------------
function initApp() {
  initSidebarToggle();
  initTabs();
  initCalculator();
  initNotes();
  initMoviePlayer(); // <--- Added missing movie player initialization

  // Search Listeners for YT Search
  const ytSearchBtn = document.getElementById("search-yt-btn");
  const ytSearchInput = document.getElementById("custom-yt-query");

  if (ytSearchBtn) {
    ytSearchBtn.addEventListener("click", runCustomYTSearch);
  }
  if (ytSearchInput) {
    ytSearchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") runCustomYTSearch();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
