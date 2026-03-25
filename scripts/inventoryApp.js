    let loadedInventory = [];
    

    function LoadInventory(){

        const id = document.getElementById('playerId').value;
        const res = await fetch(`/api/inventory/?id=${encodeURIComponent(id)}`);
        const data = await res.json();

        
    }