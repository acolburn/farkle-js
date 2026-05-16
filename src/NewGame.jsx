import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function NewGame({ setShowForm, gameId }) {
  const [newPlayerNames, setNewPlayerNames] = useState({
    player1: "",
    player2: "",
    player3: "",
    player4: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newPlayers = [
      { id: 0, name: newPlayerNames.player1, score: 0 },
      { id: 1, name: newPlayerNames.player2, score: 0 },
      { id: 2, name: newPlayerNames.player3, score: 0 },
      { id: 3, name: newPlayerNames.player4, score: 0 },
    ];
    // setPlayers(newPlayers);
    const newDice = Array.from({ length: 6 }, (_, id) => ({
      id,
      value: null,
      isLocked: false,
      isSelected: false,
    }))
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
      players: newPlayers,
      turnScore: 0,
      currentPlayerID: 0,
      dice: newDice,
    });
    setShowForm(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewPlayerNames({ ...newPlayerNames, [name]: value });
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className="text-lg px-1">Player 1 Name:</label>
        <input
          type="text"
          name="player1"
          value={newPlayerNames.player1}
          onChange={handleInputChange}
        />
        <br />
        <label className="text-lg px-1">Player 2 Name:</label>
        <input
          type="text"
          name="player2"
          value={newPlayerNames.player2}
          onChange={handleInputChange}
        />
        <br />
        <label className="text-lg px-1">Player 3 Name:</label>
        <input
          type="text"
          name="player3"
          value={newPlayerNames.player3}
          onChange={handleInputChange}
        />
        <br />
        <label className="text-lg px-1">Player 4 Name:</label>
        <input
          type="text"
          name="player4"
          value={newPlayerNames.player4}
          onChange={handleInputChange}
        />
        <br />
        <input
          type="submit"
          value="Submit"
          className="bg-green-500 px-2 py-1 rounded-lg"
        />
      </form>
      ;
    </>
  );
}
