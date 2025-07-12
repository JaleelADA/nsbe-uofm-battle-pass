import React, { useEffect, useState } from "react";
import Tabletop from "tabletop";
import { motion } from "framer-motion";

const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1EkyzaNjTQ-5sKvqex5SnTTJ6SCdq-WYIJ_Y_wU34JIU/edit?usp=sharing";

function HeaderBar({ xp }) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700">
      <h1 className="text-2xl nsbeGold animate-glow">NSBE Battle Pass</h1>
      <div className="flex items-center space-x-2">
        <span>XP: {xp}</span>
        <div className="w-40 h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-nsbeGreen transition-all duration-500"
            style={{ width: `${Math.min(xp, 100)}%` }}
          />
        </div>
      </div>
    </header>
  );
}

function App() {
  const [players, setPlayers] = useState([]);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    Tabletop.init({
      key: GOOGLE_SHEET_URL,
      simpleSheet: true,
    })
      .then((data) => {
        setPlayers(data);
        if (data.length > 0) {
          setXp(data[0].XP || 0);
        }
      })
      .catch((err) => console.warn(err));
  }, []);

  return (
    <div>
      <HeaderBar xp={xp} />
      <motion.ul layout className="space-y-4">
        {players.map((player, i) => (
          <motion.li
            key={player.Name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-gray-900 rounded-md border border-gray-700"
          >
            <h2 className="text-xl text-nsbeBlue font-semibold">{player.Name}</h2>
            <p>XP: {player.XP}</p>
            <p>Tier: {player.Tier}</p>
            <p>Recruits: {player.Recruits}</p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default App;
