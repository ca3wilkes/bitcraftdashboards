export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing Player Id" });
  }

  try {
    const invetoryRes = await fetch(`https://bitjita.com/api/players/${id}/inventories`);
    const inventoryData  = await invetoryRes.json();
    const inventoryObjects = inventoryData.inventories;

    const mappedInven = inventoryObjects.map(inv => ({
    id: inv.entityId,
    name: inv.inventoryName,
    itemCollection: inv.pockets.map(pockets =>({
      itemid: pockets.contents.itemId,
      itemInfo: inventoryData.items[pockets.contents.itemId] || inventoryData.cargos[pockets.contents.itemId] || null,
      quantit: pockets.contents.quantity
    }))
}));

  const  results = mappedInven;

    if (!mappedInven) {
      return res.status(404).json({ error: "Player not found." });
    }

    res.status(200).json({
        mappedInven
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
