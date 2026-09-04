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

  /* ---------------- Unit Converter ---------------- */
  const convUnits = {
    length: { base: 'meters', units: { meters: 1, kilometers: 1000, centimeters: 0.01, miles: 1609.344, feet: 0.3048, inches: 0.0254 } },
    weight: { base: 'grams', units: { grams: 1, kilograms: 1000, pounds: 453.59237, ounces: 28.349523125 } },
    temperature: { base: 'celsius', units: { celsius: 1, fahrenheit: 1, kelvin: 1 } }
  };

  const convCategory = document.getElementById('convCategory');
  const convFrom = document.getElementById('convFrom');
  const convTo = document.getElementById('convTo');
  const convInput = document.getElementById('convInput');
  const convResult = document.getElementById('convResult');

  function populateUnitSelects() {
    const cat = convCategory.value;
    const unitNames = Object.keys(convUnits[cat].units);
    convFrom.innerHTML = unitNames.map(u => `<option value="${u}">${capitalize(u)}</option>`).join('');
    convTo.innerHTML = unitNames.map(u => `<option value="${u}">${capitalize(u)}</option>`).join('');
    convTo.selectedIndex = unitNames.length > 1 ? 1 : 0;
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function convCategoryChanged() { populateUnitSelects(); convertUnits(); }

  function tempToCelsius(value, unit) {
    if (unit === 'celsius') return value;
    if (unit === 'fahrenheit') return (value - 32) * 5 / 9;
    if (unit === 'kelvin') return value - 273.15;
  }

  function celsiusToTemp(value, unit) {
    if (unit === 'celsius') return value;
    if (unit === 'fahrenheit') return (value * 9 / 5) + 32;
    if (unit === 'kelvin') return value + 273.15;
  }

  function convertUnits() {
    const cat = convCategory.value;
    const from = convFrom.value;
    const to = convTo.value;
    const value = parseFloat(convInput.value);

    if (isNaN(value)) { convResult.innerHTML = '—'; return; }

    let result;
    if (cat === 'temperature') {
      const celsius = tempToCelsius(value, from);
      result = celsiusToTemp(celsius, to);
    } else {
      const units = convUnits[cat].units;
      const base = value * units[from];
      result = base / units[to];
    }

    const rounded = Math.round(result * 10000) / 10000;
    convResult.innerHTML = `${rounded} <span class="unit">${capitalize(to)}</span>`;
  }

  convCategory.addEventListener('change', convCategoryChanged);
  convFrom.addEventListener('change', convertUnits);
  convTo.addEventListener('change', convertUnits);
  convInput.addEventListener('input', convertUnits);

  populateUnitSelects();
  convertUnits();

  /* ---------------- To-Do List ---------------- */
  const todoInput = document.getElementById('todoInput');
  const todoListEl = document.getElementById('todoList');
  const addTodoBtn = document.getElementById('addTodoBtn');
  let todos = JSON.parse(localStorage.getItem('toolkit_todos') || '[]');

  function saveTodos() { localStorage.setItem('toolkit_todos', JSON.stringify(todos)); }

  function renderTodos() {
    if (todos.length === 0) {
      todoListEl.innerHTML = '<li class="todo-empty" style="list-style:none;">Nothing here yet — add your first task above.</li>';
      return;
    }
    todoListEl.innerHTML = todos.map((t, i) => `
      <li class="${t.done ? 'done' : ''}">
        <input type="checkbox" ${t.done ? 'checked' : ''} data-todo-toggle="${i}">
        <span class="txt">${escapeHtml(t.text)}</span>
        <button class="del" data-todo-del="${i}">✕</button>
      </li>
    `).join('');

    todoListEl.querySelectorAll('[data-todo-toggle]').forEach(cb => {
      cb.addEventListener('change', (e) => toggleTodo(e.target.dataset.todoToggle));
    });

    todoListEl.querySelectorAll('[data-todo-del]').forEach(btn => {
      btn.addEventListener('click', (e) => deleteTodo(e.target.dataset.todoDel));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function addTodo() {
    const val = todoInput.value.trim();
    if (!val) return;
    todos.push({ text: val, done: false });
    todoInput.value = '';
    saveTodos();
    renderTodos();
  }

  function toggleTodo(i) { todos[i].done = !todos[i].done; saveTodos(); renderTodos(); }
  function deleteTodo(i) { todos.splice(i, 1); saveTodos(); renderTodos(); }

  addTodoBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });

  renderTodos();

  /* ---------------- Native Solitaire Engine ---------------- */
  const suits = ['♥', '♦', '♣', '♠'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let moves = 0, score = 0;
  let deck = [], stock = [], waste = [], tableau = [[], [], [], [], [], [], []];

  const newGameBtn = document.getElementById('solitaireNewGame');
  if (newGameBtn) newGameBtn.addEventListener('click', initSolitaire);

  function initSolitaire() {
    moves = 0; score = 0;
    document.getElementById('solitaireMoves').textContent = moves;
    document.getElementById('solitaireScore').textContent = score;

    deck = [];
    suits.forEach(suit => {
      const isRed = suit === '♥' || suit === '♦';
      values.forEach((val, idx) => {
        deck.push({ value: val, rank: idx + 1, suit: suit, isRed: isRed, faceUp: false });
      });
    });

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    tableau = [[], [], [], [], [], [], []];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.pop();
        if (j === i) card.faceUp = true;
        tableau[i].push(card);
      }
    }

    stock = deck; waste = [];
    renderBoard();
  }

  function renderBoard() {
    const stockEl = document.getElementById('solStock');
    stockEl.innerHTML = '';
    if (stock.length > 0) stockEl.appendChild(createCardElement(stock[stock.length - 1], false));

    const wasteEl = document.getElementById('solWaste');
    wasteEl.innerHTML = '';
    if (waste.length > 0) wasteEl.appendChild(createCardElement(waste[waste.length - 1], true));

    const tableauPiles = document.querySelectorAll('.tableau-pile');
    tableauPiles.forEach((pileEl, index) => {
      pileEl.innerHTML = '';
      tableau[index].forEach((card, cardIndex) => {
        const cardEl = createCardElement(card, card.faceUp);
        cardEl.style.top = `${cardIndex * 22}px`;
        pileEl.appendChild(cardEl);
      });
    });
  }

  function createCardElement(card, faceUp = true) {
    const el = document.createElement('div');
    el.className = `sol-card ${card.isRed ? 'red' : 'black'} ${faceUp ? '' : 'back'}`;
    if (faceUp) {
      el.innerHTML = `<div>${card.value}</div><div class="card-suit">${card.suit}</div>`;
    }
    return el;
  }

  const stockEl = document.getElementById('solStock');
  if (stockEl) {
    stockEl.addEventListener('click', () => {
      if (stock.length > 0) {
        const card = stock.pop();
        card.faceUp = true;
        waste.push(card);
      } else if (waste.length > 0) {
        stock = waste.reverse().map(c => ({ ...c, faceUp: false }));
        waste = [];
      }
      moves++;
      document.getElementById('solitaireMoves').textContent = moves;
      renderBoard();
    });
  }

  initSolitaire();
});