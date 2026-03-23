let loadedPlayers = [];

async function loadMembers() {
  const id = document.getElementById("empireId").value.trim();

  const res = await fetch(`/api/empires?id=${encodeURIComponent(id)}`);
  const data = await res.json();

  loadedPlayers = data;
  renderPlayers(data);
}

function renderPlayers(players) {
  const container = document.getElementById("output");
  container.innerHTML = "";

  players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player";

    const sortedSkills = [...player.experience].sort((a, b) => b.quantity - a.quantity);

    let rows = sortedSkills.map(skill => `
      <tr>
        <td>${skill.icon} ${skill.skill_name}</td>
        <td>${skill.quantity.toLocaleString()}</td>
        <td>${skill.level}</td>
        <td>
          <div class="progress">
            <div class="progress-bar" style="width:${(skill.progress * 100).toFixed(1)}%"></div>
          </div>
        </td>
      </tr>
    `).join("");

    div.innerHTML = `
      <div class="header" onclick="toggleSkills('${player.id}')">
        <h2>${player.name}</h2>
        <div>
          <strong>Total XP:</strong> ${player.totalXP.toLocaleString()} |
          <strong>Total Levels:</strong> ${player.totalLevels}
        </div>
      </div>

      <div id="skills-${player.id}" class="skills">
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>XP</th>
              <th>Level</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    container.appendChild(div);
  });
}

function toggleSkills(id) {
  const el = document.getElementById(`skills-${id}`);
  el.style.display = el.style.display === "block" ? "none" : "block";
}

function filterPlayers() {
  const q = document.getElementById("searchBox").value.toLowerCase();
  renderPlayers(loadedPlayers.filter(p => p.name.toLowerCase().includes(q)));
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
