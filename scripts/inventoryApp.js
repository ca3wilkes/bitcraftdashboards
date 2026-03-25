    let loadedInventory = [];
    

    function LoadInventory(){

        const id = document.getElementById('playerId').value;
        const res = fetch(`/api/inventory/?id=${encodeURIComponent(id)}`);
        const data = res.json();

        
    }