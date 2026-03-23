export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing empire ID" });
  }

  try {
    const empireRes = await fetch(`https://bitjita.com/api/empires/${id}`);
    const empireData = await empireRes.json();

    if (!empireData.members) {
      return res.status(404).json({ error: "Empire not found or no members" });
    }

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
            // Removes any and hexite gathering.
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

              if (needed > 0) {
                progress = gained / needed;
              } else {
                progress = 0;
              }

              if (!Number.isFinite(progress)) progress = 0;
              if (progress < 0) progress = 0;
              if (progress > 1) progress = 1;
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

    const empireInfo = {
      id:  empireData.id,
      name: empireData.name
    }

    res.status(200).json({
      empire: empireInfo,
      members: results
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
