    let loadedInventory = [];
    

    async function LoadInventory(){

        const id = document.getElementById('playerId').value;
        const res = await fetch(`/api/inventory?id=${encodeURIComponent(id)}`);
        const data = await res.json();

        
      loadedInventory = data;
      expandedPlayers = new Set();
      renderPlayers(loadedInventory);
    }
    


    function renderInventories(inventories) {
      const container = document.getElementById("output");
      container.innerHTML = "";

      inventories.forEach(inventory => {
        const div = document.createElement("div");
        div.className = "player";

        let sortedItems = [...inventory.itemCollection];

        let rows = sortedItems.map(item => {
        
          return `
          <tr>
            <td>${item.id}</td>
            <td>${item.itemInfo.name}</td>
            <td>${item.quantity.toLocaleString()}</td>
            <td>
            </td>
          </tr>`;
        }).join("");

        const isExpanded = expandedinventorys.has(String(inventory.id));

        div.innerHTML = `
          <div class="header ${isExpanded ? "expanded" : ""}">
            <button class="expand-btn" onclick="toggleSkills('${inventory.id}', this)">
              <span>${isExpanded ? "▼" : "►"}</span>
            </button>

            <h2 style="margin:0; flex-grow:1;">${inventory.name}</h2>

            <div>
              <strong>Total XP:</strong> ${inventory.totalXP.toLocaleString()} |
              <strong>Total Levels:</strong> ${inventory.totalLevels}
            </div>
          </div>

          <div id="skills-${inventory.id}" class="skills" style="display:${isExpanded ? "block" : "none"};">
            <table>
              <thead>
                <tr>
                  <th onclick="sortColumn(event, '${inventory.id}', 'skill_name')">
                    Skill <span class="sort-arrow" id="arrow-${inventory.id}-skill_name"></span>
                    <div class="resize-handle"></div>
                  </th>
                  <th onclick="sortColumn(event, '${inventory.id}', 'quantity')">
                    XP <span class="sort-arrow" id="arrow-${inventory.id}-quantity"></span>
                    <div class="resize-handle"></div>
                  </th>
                  <th onclick="sortColumn(event, '${inventory.id}', 'level')">
                    Level <span class="sort-arrow" id="arrow-${inventory.id}-level"></span>
                    <div class="resize-handle"></div>
                  </th>
                  <th>
                    Progress
                    <div class="resize-handle"></div>
                  </th>
                </tr>
              </thead>
              <tbody id="tbody-${inventory.id}">${rows}</tbody>
            </table>
          </div>
        `;

        container.appendChild(div);
      });

      enableColumnResizing();
    }