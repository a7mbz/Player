// 🔑 YOUR GOOGLE YOUTUBE V3 API KEY
const CUSTOM_YT_KEY = "AIzaSyCgEU5RK5bwqoDrV5QRORXc-E_2M2HjKNY";

// 1. Sidebar Tab Switcher
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

// 2. YT Search Engine (YouTube Data API v3)
async function runCustomYTSearch() {
  const inputVal = document.getElementById("custom-yt-query")?.value.trim();
  const gridTarget = document.getElementById("custom-yt-results");
  const labelStatus = document.getElementById("custom-yt-status");

  if (!inputVal || !gridTarget) return;

  labelStatus.innerText = "Searching global library indexes...";
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
        frameContainer.innerHTML = `
          <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                  src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
          </iframe>
        `;
        dynamicItem.onclick = null;
      };

      gridTarget.appendChild(dynamicItem);
    });

  } catch (err) {
    if (labelStatus) labelStatus.innerText = `Network Connection Blocked: ${err.message}`;
  }
}

// 3. Direct YT Player
function initYTPlayer() {
  const playBtn = document.getElementById("playBtn");
  const ytInput = document.getElementById("ytUrl");
  const player = document.getElementById("player");

  if (!playBtn || !ytInput || !player) return;

  playBtn.addEventListener("click", () => {
    const val = ytInput.value.trim();
    if (!val) return;

    let videoId = val;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = val.match(regExp);

    if (match && match[2].length === 11) {
      videoId = match[2];
    }

    player.innerHTML = `
      <iframe style="width: 100%; height: 380px; border: 0; border-radius: 6px;" 
              src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
      </iframe>
    `;
  });
}

// 4. Calculator
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

// 5. Notes Engine (Auto Save)
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

// 6. Application Initialization
function initApp() {
  initTabs();
  initYTPlayer();
  initCalculator();
  initNotes();

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
