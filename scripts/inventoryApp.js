    let loadedInventory = [];
    

    async function LoadInventory(){

        const id = document.getElementById('playerId').value;
        const res = await fetch(`/api/inventory?id=${encodeURIComponent(id)}`);
        const data = await res.json();

        
      loadedInventory = data;
      expandedinventorys = new Set();
      renderInventories(loadedInventory.mappedInven);
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
            <td>${item.quantity}</td>
            <td>
            </td>
          </tr>`;
        }).join("");
    })

    }