// Load saved empire + favourites on startup
window.addEventListener("DOMContentLoaded", () => {
  loadSavedEmpireId();
  renderFavourites();
});

// Save & auto-load last empire
function loadSavedEmpireId() {
  const savedId = localStorage.getItem("lastEmpireId");
  if (savedId) {
    document.getElementById("empireId").value = savedId;
    loadMembers();
  }
}

// Add current empire to favourites
function favouriteCurrentEmpire() {
  const id = document.getElementById("empireId").value.trim();
  const name = document.getElementById("empireHeader").innerText.trim();

  if (!id || !name) return;

  const favs = JSON.parse(localStorage.getItem("favouriteEmpires") || "[]");

  if (!favs.some(f => f.id === id)) {
    favs.push({ id, name });
    localStorage.setItem("favouriteEmpires", JSON.stringify(favs));
  }

  renderFavourites();
}

// Render favourites dropdown
function renderFavourites() {
  const favs = JSON.parse(localStorage.getItem("favouriteEmpires") || "[]");
  const select = document.getElementById("favouriteSelect");

  select.innerHTML = `<option value="">-- Select Favourite --</option>`;

  favs.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.name} (ID: ${f.id})`;
    select.appendChild(opt);
  });
}

// Load empire from dropdown
function loadEmpireFromFavourite() {
  const id = document.getElementById("favouriteSelect").value;
  if (!id) return;

  document.getElementById("empireId").value = id;
  loadMembers();
}

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
