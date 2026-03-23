let loadedPlayers = [];
let sortState = {};
let expandedPlayers = new Set();

async function loadMembers() {
  const id = document.getElementById("empireId").value.trim();
  if (!id) return alert("Enter an empire ID");

  // Save last used empire
  localStorage.setItem("lastEmpireId", id);

  // Fetch empire data directly from Bitjita
  const empireRes = await fetch(`https://bitjita.com/api/empires/${id}`);
  const empireData = await empireRes.json();

  // Set empire name header
  document.getElementById("empireHeader").innerText = empireData.name || "Empire";

  // Fetch levels
  const levelsRes = await fetch("https://bitjita.com/static/experience/levels.json");
  const levels = await levelsRes.json();

  function getLevelFromXP(xp) {
    let level = 1;
    for (let i = 0; i < levels.length; i++) {
      if (xp >= levels[i].xp) level = levels[i].level;
      else break;
    }
    return level;
  }

  // Fetch all players
  const results = await Promise.all(
    empireData.members.map(async (member) => {
      const playerRes = await fetch(`https://bitjita.com/api/players/${member.entityId}`);
      const playerData = await playerRes.json();

      const experience = playerData.player?.experience || [];
      const skillMap = playerData.player?.skillMap || {};

      let totalXP = 0;
      let totalLevels = 0;

      const mappedExperience = experience
        .map(e => {
          if (e.skill_id === 1 || e.skill_id === 22) return null;

          const skill = skillMap[e.skill_id] || {};
          const xp = Number(e.quantity) || 0;

          const level = getLevelFromXP(xp);

          const levelObj = levels.find(l => l.level === level);
          const nextLevelObj = levels.find(l => l.level === level + 1);

          const currentLevelXP = Number(levelObj?.xp ?? 0);
          const nextLevelXP = nextLevelObj ? Number(nextLevelObj.xp) : null;

          let progress = 1;

          if (nextLevelXP !== null) {
            const gained = xp - currentLevelXP;
            const needed = nextLevelXP - currentLevelXP;

            progress = needed > 0 ? gained / needed : 0;

            if (!Number.isFinite(progress)) progress = 0;
            progress = Math.max(0, Math.min(1, progress));
          }

          totalXP += xp;
          totalLevels += level;

          return {
            quantity: xp,
            level,
            current_level_xp: currentLevelXP,
            next_level_xp: nextLevelXP,
            progress,
            skill_id: e.skill_id,
            skill_name: skill.name || "Unknown",
            icon: skill.iconAssetName || ""
          };
        })
        .filter(Boolean);

      return {
        id: member.entityId,
        name: member.playerName,
        totalXP,
        totalLevels,
        experience: mappedExperience
      };
    })
  );

  results.sort((a, b) => b.totalXP - a.totalXP);

  loadedPlayers = results;
  expandedPlayers = new Set();

  renderPlayers(results);
}

async function refreshData() {
  if (!document.getElementById("empireId").value.trim()) return;
  await loadMembers();
}

function sortSkills(skills, key) {
  if (!sortState[key]) sortState[key] = "asc";
  else if (sortState[key] === "asc") sortState[key] = "desc";
  else sortState[key] = null;

  if (!sortState[key]) return skills;

  return [...skills].sort((a, b) => {
    if (sortState[key] === "asc") return a[key] > b[key] ? 1 : -1;
    return a[key] < b[key] ? 1 : -1;
  });
}

function renderPlayers(players) {
  const container = document.getElementById("output");
  container.innerHTML = "";

  players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player";

    let rows = player.experience.map(skill => {
      const percent = (skill.progress * 100).toFixed(1);
      const needed = skill.next_level_xp ? (skill.next_level_xp - skill.quantity) : 0;

      return `
        <tr>
          <td>${skill.icon} ${skill.skill_name}</td>
          <td>${skill.quantity.toLocaleString()}</td>
          <td>${skill.level}</td>
          <td>
            <div class="tooltip">
              <div class="progress">
                <div class="progress-bar" style="width:${percent}%"></div>
                <div class="progress-text">${percent}%</div>
              </div>
              <div class="tooltiptext">
                <strong>Level ${skill.level} → ${skill.level + 1}</strong><br>
                XP: ${skill.quantity.toLocaleString()} / ${skill.next_level_xp?.toLocaleString() ?? "MAX"}<br>
                Needed: ${needed.toLocaleString()} XP<br>
                Progress: ${percent}%
              </div>
            </div>
          </td>
        </tr>`;
    }).join("");

    const isExpanded = expandedPlayers.has(String(player.id));

    div.innerHTML = `
      <div class="header ${isExpanded ? "expanded" : ""}">
        <button class="expand-btn" onclick="toggleSkills('${player.id}', this)">
          <span>${isExpanded ? "▼" : "►"}</span>
        </button>
        <h2 style="margin:0; flex-grow:1;">${player.name}</h2>
        <div>
          <strong>Total XP:</strong> ${player.totalXP.toLocaleString()} |
          <strong>Total Levels:</strong> ${player.totalLevels}
        </div>
      </div>

      <div id="skills-${player.id}" class="skills" style="display:${isExpanded ? "block" : "none"};">
        <table>
          <thead>
            <tr>
              <th onclick="sortColumn(event, '${player.id}', 'skill_name')">
                Skill <span class="sort-arrow" id="arrow-${player.id}-skill_name"></span>
                <div class="resize-handle"></div>
              </th>
              <th onclick="sortColumn(event, '${player.id}', 'quantity')">
                XP <span class="sort-arrow" id="arrow-${player.id}-quantity"></span>
                <div class="resize-handle"></div>
              </th>
              <th onclick="sortColumn(event, '${player.id}', 'level')">
                Level <span class="sort-arrow" id="arrow-${player.id}-level"></span>
                <div class="resize-handle"></div>
              </th>
              <th>Progress <div class="resize-handle"></div></th>
            </tr>
          </thead>
          <tbody id="tbody-${player.id}">${rows}</tbody>
        </table>
      </div>
    `;

    container.appendChild(div);
  });

  enableColumnResizing();
}

function toggleSkills(id, btn) {
  const el = document.getElementById(`skills-${id}`);
  const expanded = el.style.display === "block";
  const key = String(id);

  if (expanded) {
    el.style.display = "none";
    expandedPlayers.delete(key);
  } else {
    el.style.display = "block";
    expandedPlayers.add(key);
  }

  btn.parentElement.classList.toggle("expanded", !expanded);
  btn.querySelector("span").textContent = expanded ? "►" : "▼";
}

function sortColumn(event, playerId, key) {
  event.stopPropagation();

  const player = loadedPlayers.find(p => String(p.id) === String(playerId));
  if (!player) return;

  player.experience = sortSkills(player.experience, key);

  const tbody = document.getElementById(`tbody-${playerId}`);
  if (!tbody) return;

  const rows = player.experience.map(skill => {
    const percent = (skill.progress * 100).toFixed(1);
    const needed = skill.next_level_xp ? (skill.next_level_xp - skill.quantity) : 0;

    return `
      <tr>
        <td>${skill.icon} ${skill.skill_name}</td>
        <td>${skill.quantity.toLocaleString()}</td>
        <td>${skill.level}</td>
        <td>
          <div class="tooltip">
            <div class="progress">
              <div class="progress-bar" style="width:${percent}%"></div>
              <div class="progress-text">${percent}%</div>
            </div>
            <div class="tooltiptext">
              <strong>Level ${skill.level} → ${skill.level + 1}</strong><br>
              XP: ${skill.quantity.toLocaleString()} / ${skill.next_level_xp?.toLocaleString() ?? "MAX"}<br>
              Needed: ${needed.toLocaleString()} XP<br>
              Progress: ${percent}%
            </div>
          </div>
        </td>
      </tr>`;
  }).join("");

  tbody.innerHTML = rows;

  ["skill_name", "quantity", "level"].forEach(col => {
    const arrow = document.getElementById(`arrow-${playerId}-${col}`);
    if (arrow) arrow.textContent = "";
  });

  const arrow = document.getElementById(`arrow-${playerId}-${key}`);
  if (arrow) {
    if (sortState[key] === "asc") arrow.textContent = "▲";
    else if (sortState[key] === "desc") arrow.textContent = "▼";
    else arrow.textContent = "";
  }
}

function filterPlayers() {
  const q = document.getElementById("searchBox").value.toLowerCase();
  const filtered = loadedPlayers.filter(p => p.name.toLowerCase().includes(q));
  renderPlayers(filtered);
}

function enableColumnResizing() {
  document.querySelectorAll(".resize-handle").forEach(handle => {
    handle.addEventListener("mousedown", e => {
      const th = e.target.parentElement;
      const startX = e.pageX;
      const startWidth = th.offsetWidth;

      document.onmousemove = function (e) {
        th.style.width = (startWidth + (e.pageX - startX)) + "px";
      };

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    });
  });
}
