import React from "react";
import { sharedStyles } from "../styles/sharedStyles";

function Header({ xp }) {
  return (
    <header className={sharedStyles.header}>
      <h1 className={sharedStyles.glowText}>NSBE Battle Pass</h1>
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

export default Header;
