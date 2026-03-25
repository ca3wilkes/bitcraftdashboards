export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing Player Id" });
  }

  try {
    const invetoryRes = await fetch(`https://bitjita.com/api/players/${id}/inventories`);
    const inventoryData  = await invetoryRes.json();



    if (!mappedInven) {
      return res.status(404).json({ error: "Player not found." });
    }

    

    res.status(200).json({
        inventory: inventoryData,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Player data" });
  }
}
