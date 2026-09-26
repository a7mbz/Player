document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Tool switching ---------------- */
  document.querySelectorAll('.tool-switch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-switch').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
    });
  });

  /* ---------------- YT Player ---------------- */
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', playVideo);
  }

  function playVideo() {
    let input = document.getElementById('ytUrl').value.trim();
    let videoId = '';

    if (input.includes('v=')) {
      videoId = input.split('v=')[1].split('&')[0];
    } else if (input.includes('youtu.be/')) {
      videoId = input.split('youtu.be/')[1].split('?')[0];
    } else {
      videoId = input;
    }

    if (videoId) {
      document.getElementById('player').innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" allowfullscreen></iframe>`;
    } else {
      alert('That link doesn\'t look right — try pasting the full YouTube URL.');
    }
  }

  /* ---------------- Movies Player with TMDB API Search ---------------- */
  const TMDB_API_KEY = '6879b7d28a8f74a9cbc2e792338d9c89'; // Public TMDB Read Key
  const movieSearchInput = document.getElementById('movieSearchInput');
  const movieTypeSelect = document.getElementById('movieTypeSelect');
  const searchMovieBtn = document.getElementById('searchMovieBtn');
  const searchResults = document.getElementById('searchResults');
  const tvControls = document.getElementById('tvControls');
  const tvSeasonInput = document.getElementById('tvSeasonInput');
  const tvEpisodeInput = document.getElementById('tvEpisodeInput');
  const updateTvBtn = document.getElementById('updateTvBtn');
  const movieIframe = document.getElementById('movieIframe');
  const serverBtns = document.querySelectorAll('.server-btn');

  let currentServer = 'vidsrc';
  let selectedTmdbId = '550';

  if (movieTypeSelect) {
    movieTypeSelect.addEventListener('change', () => {
      tvControls.style.display = movieTypeSelect.value === 'tv' ? 'flex' : 'none';
    });
  }

  // البحث بالاسم
  async function searchMovies() {
    const query = movieSearchInput.value.trim();
    const type = movieTypeSelect.value;

    if (!query) return;

    searchResults.innerHTML = '<p style="color:var(--text-dim); font-size:12px;">Searching...</p>';

    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        searchResults.innerHTML = '<p style="color:var(--text-dim); font-size:12px;">No results found.</p>';
        return;
      }

      searchResults.innerHTML = '';
      data.results.slice(0, 10).forEach(item => {
        const title = item.title || item.name;
        const poster = item.poster_path 
          ? `https://image.tmdb.org/t/p/w200${item.poster_path}` 
          : 'https://via.placeholder.com/100x140?text=No+Cover';

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
          <img src="${poster}" alt="${title}">
          <div class="movie-card-title">${title}</div>
        `;

        card.addEventListener('click', () => {
          selectedTmdbId = item.id;
          updateMoviePlayer();
        });

        searchResults.appendChild(card);
      });
    } catch (err) {
      searchResults.innerHTML = '<p style="color:var(--danger); font-size:12px;">Search failed. Check your connection.</p>';
    }
  }

  function getMovieEmbedUrl(server, type, id, season, episode) {
    if (type === 'movie') {
      if (server === 'vidsrc') return `https://vidsrc.to/embed/movie/${id}`;
      if (server === 'autoembed') return `https://player.autoembed.cc/embed/movie/${id}`;
      if (server === 'embed2') return `https://www.2embed.cc/embed/${id}`;
    } else {
      if (server === 'vidsrc') return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
      if (server === 'autoembed') return `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
      if (server === 'embed2') return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    }
    return '';
  }

  function updateMoviePlayer() {
    const type = movieTypeSelect.value;
    const season = tvSeasonInput.value || 1;
    const episode = tvEpisodeInput.value || 1;

    const url = getMovieEmbedUrl(currentServer, type, selectedTmdbId, season, episode);
    if (movieIframe) {
      movieIframe.src = url;
    }
  }

  if (searchMovieBtn) {
    searchMovieBtn.addEventListener('click', searchMovies);
    movieSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchMovies();
    });
  }

  if (updateTvBtn) {
    updateTvBtn.addEventListener('click', updateMoviePlayer);
  }

  serverBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      serverBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentServer = btn.dataset.server;
      updateMoviePlayer();
    });
  });

  /* ---------------- Calculator ---------------- */
  let calcExpr = '';
  const calcDisplay = document.getElementById('calcDisplay');

  document.querySelectorAll('[data-calc-input]').forEach(btn => {
    btn.addEventListener('click', () => calcInput(btn.dataset.calcInput));
  });

  document.querySelectorAll('[data-calc-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.calcAction;
      if (action === 'clear') calcClear();
      if (action === 'equals') calcEquals();
    });
  });

  function calcInput(val) {
    calcExpr += val;
    calcDisplay.textContent = calcExpr;
  }

  function calcClear() {
    calcExpr = '';
    calcDisplay.textContent = '0';
  }

  function calcEquals() {
    if (!calcExpr) return;
    try {
      if (!/^[0-9+\-*/(). ]+$/.test(calcExpr)) throw new Error('invalid');
      const result = Function('"use strict"; return (' + calcExpr + ')')();
      calcDisplay.textContent = result;
      calcExpr = String(result);
    } catch (e) {
      calcDisplay.textContent = 'Error';
      calcExpr = '';
    }
  }

  /* ---------------- Notes ---------------- */
  const notesArea = document.getElementById('notesArea');
  const notesStatus = document.getElementById('notesStatus');
  notesArea.value = localStorage.getItem('toolkit_notes') || '';
  let notesTimer;

  notesArea.addEventListener('input', () => {
    notesStatus.textContent = 'Saving...';
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      localStorage.setItem('toolkit_notes', notesArea.value);
      notesStatus.textContent = 'All changes saved';
    }, 400);
  });


<!-- LIVE SEARCH EXECUTION ENGINE -->
<script>
  // 🔑 YOUR GOOGLE YOUTUBE V3 API KEY
  const CUSTOM_YT_KEY = "AIzaSyCgEU5RK5bwqoDrV5QRORXc-E_2M2HjKNY"; 

  async function runCustomYTSearch() {
    const inputVal = document.getElementById("custom-yt-query").value.trim();
    const gridTarget = document.getElementById("custom-yt-results");
    const labelStatus = document.getElementById("custom-yt-status");

    if (!inputVal) return;

    labelStatus.innerText = "Searching global library indexes...";
    gridTarget.innerHTML = ""; 

    // Explicit direct URL endpoint parameter configuration string
    const targetEndpoint = `https://googleapis.com{encodeURIComponent(inputVal)}&type=video&key=${CUSTOM_YT_KEY}`;

    try {
      const apiFetch = await fetch(targetEndpoint);
      const payloadResult = await apiFetch.json();

      // Catch structural errors returned directly by Google's API server
      if (!apiFetch.ok) {
        console.error("Google API Failure Object:", payloadResult);
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
        
        let thumbUrl = "https://unsplash.com"; 
        if (videoItem.snippet.thumbnails && videoItem.snippet.thumbnails.high) {
          thumbUrl = videoItem.snippet.thumbnails.high.url;
        }

        const dynamicItem = document.createElement("div");
        dynamicItem.style.cssText = "background: #161616; border: 1px solid #222; border-radius: 6px; overflow: hidden; cursor: pointer; transition: transform 0.2s, border-color 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column;";
        
        dynamicItem.onmouseenter = () => { dynamicItem.style.borderColor = '#3a3a3a'; dynamicItem.style.transform = 'translateY(-2px)'; };
        dynamicItem.onmouseleave = () => { dynamicItem.style.borderColor = '#222'; dynamicItem.style.transform = 'translateY(0)'; };

        dynamicItem.innerHTML = `
          <div style="position: relative; padding-bottom: 56.25%; background: #000; overflow: hidden;">
            <img src="${thumbUrl}" alt="Preview" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; object-fit: cover; opacity: 0.85;">
            <div class="play-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.5); opacity:0; transition: opacity 0.2s;">
               <svg width="36" height="36" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
          <div style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.85rem; font-weight: 600; color: #eaeaea; line-height: 1.4; max-height: 2.8em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 4px;">
              ${title}
            </div>
            <div style="font-size: 0.75rem; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${channelName}
            </div>
          </div>
        `;

        dynamicItem.onclick = function() {
          const frameContainer = this.firstElementChild;
          // Privacy protection domain without cookies
          frameContainer.innerHTML = `
            <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                    src="https://youtube-nocookie.com{id}?autoplay=1" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
          `;
          dynamicItem.onclick = null; 
        };

        const overlay = dynamicItem.querySelector('.play-overlay');
        dynamicItem.addEventListener('mouseenter', () => overlay.style.opacity = '1');
        dynamicItem.addEventListener('mouseleave', () => overlay.style.opacity = '0');

        gridTarget.appendChild(dynamicItem);
      });

    } catch (err) {
      console.error(err);
      labelStatus.innerText = `Network Connection Blocked: ${err.message}`;
    }
  }

  // Navigation Panel Integration Sidebar Script Hooks
  document.addEventListener("DOMContentLoaded", () => {
    const switches = document.querySelectorAll(".rail .tool-switch");
    const panels = document.querySelectorAll("main.main .panel");

    switches.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetAttr = btn.getAttribute("data-panel");
        if (targetAttr === "yt-search") {
          switches.forEach(s => s.classList.remove("active"));
          panels.forEach(p => p.classList.remove("active"));
          
          btn.classList.add("active");
          const searchPanel = document.getElementById("panel-yt-search");
          if (searchPanel) searchPanel.classList.add("active");
        }
      });
    });
  });
</script>


  initSolitaire();
});
