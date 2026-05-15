// src/useGameRoom.js
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase"; // Import your Firebase config

export function GetStateOnline(gameId) {
  // 1. Group all your game states inside the hook
  const [dice, setDice] = useState([1, 1]);
  const [turnScore, setTurnScore] = useState(0);
  const [players, setPlayers] = useState([]);
  const [currentPlayerID, setCurrentPlayerID] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks if data has arrived yet

  useEffect(() => {
    // If there is no gameId provided, do nothing
    if (!gameId) return;

    const gameRef = doc(db, "games", gameId);

    // Set up the real-time listener (from Step 3)
    const unsubscribe = onSnapshot(gameRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        // Update local hook states
        setDice(data.dice);
        setTurnScore(data.turnScore);
        setPlayers(data.players);
        setCurrentPlayerID(data.currentPlayerID);
        setLoading(false); // Data has loaded successfully
      } else {
        console.log("Room not found");
        setLoading(false);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [gameId]);

  // 2. Return the states so your UI component can read them
  return { dice, turnScore, players, currentPlayerID, loading };
}
