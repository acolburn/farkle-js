// src/useGameRoom.js
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase"; // Import your Firebase config

export default function GetStateOnline(gameId) {
  // 1. Group all your game states inside the hook
  //   const [dice, setDice] = useState([1, 2, 3, 4, 5, 6]);
  const [dice, setDice] = useState(
    Array.from({ length: 6 }, (_, id) => ({
      id,
      value: null,
      isLocked: false,
      isSelected: false,
    })),
  );
  const [turnScore, setTurnScore] = useState(0);
  //   const [players, setPlayers] = useState([]);
  const [players, setPlayers] = useState([
    { id: 0, name: "player1", score: 0 },
    { id: 1, name: "player2", score: 0 },
    { id: 2, name: "player3", score: 0 },
    { id: 3, name: "player4", score: 0 },
  ]);
  const [currentPlayerID, setCurrentPlayerID] = useState(0);
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
