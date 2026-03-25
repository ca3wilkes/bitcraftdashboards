export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing Player Id" });
  }

  try {
    const invetoryRes = await fetch(`https://bitjita.com/api/players/${id}/inventories`);
    const inventoryData  = await invetoryRes.json();

//     const inventoryObjects = inventoryData.inventories || [];

//     const mappedInventories = inventoryObjects.filter(inv => inv.inventoryName.includes("Personal Cache")).map(inv => ({
         
//             return: {
//                 entityId: inv.entityId,
//                 inventoryName: inv.inventoryName,
//                 itemCollection: inv.pockets.contents.map(contents => ({
//                     itemId: contents.itemId,
//                     quantity: contents.quantity
//             })
//         )}
        
    
//   }));

//     if (!mappedInventories) {
//       return res.status(404).json({ error: "Player not found." });
//     }

//     results = mappedInventories;

    res.status(200).json({
        inventory: inventoryData.inventories || []
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Player data" });
  }
}
