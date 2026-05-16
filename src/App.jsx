import { useState } from "react";
import Header from "./Header";
import Scoreboard from "./Scoreboard";
import Die from "./Die";
import Rollboard from "./Rollboard";
import NewGame from "./NewGame";
import GetStateOnline from "./GetStateOnline";
import { doc, updateDoc} from "firebase/firestore";
import { db } from "./firebase";

function App() {
  // 1. Call your custom hook to get the real-time states
  const gameId = "room123"; //for test purposes
  const { dice, turnScore, players, currentPlayerID, loading } =
    GetStateOnline(gameId);


  // New game form where players enter names
  const [showForm, setShowForm] = useState(false);


  function endTurn() {
  let rollScore = 0;
  if (!dice || dice.length === 0) return;

  const selectedDice = dice.filter((die) => die.isSelected);

  if (selectedDice.length > 0) {
    if (checkForFarkle(selectedDice)) {
      const audio = new Audio("farkle3.mp3");
      audio.play();
      resetDice(0, true); // True = Did Farkle
      return;
    } else {
      // Calculate any final unbanked dice selected on the board
      const { score } = calculateScoreValue(selectedDice);
      rollScore = score;
    }
  }
  
  resetDice(rollScore, false); // False = Voluntarily ended turn, keep points!
}

 async function resetDice(rollScore, didFarkle) {
  const playerToUpdate = currentPlayerID;

  // If they farkled, turn score is wiped out. 
  // Otherwise, they get their accumulated turn score plus any final table dice.
  const totalTurnScore = didFarkle ? 0 : turnScore + rollScore;

  // They are allowed to score if they didn't farkle AND they actually accumulated points
  let canBankPoints = !didFarkle && totalTurnScore > 0;
  let hasMinimumHand = true;
  let updatedPlayers = [...players];

  if (canBankPoints) {
    // Check for the 500-point initial minimum game rule
    for (const player of players) {
      if (player.id === playerToUpdate) {
        if (player.score === 0 && totalTurnScore < 500) {
          alert("You need at least 500 pts to start game");
          hasMinimumHand = false;
        }
      }
    }

    if (!hasMinimumHand) {
      // Exit out and let them roll again or fix their selection
      return; 
    }

    // Accumulate points safely into the array
    updatedPlayers = players.map((player) =>
      player.id === playerToUpdate
        ? { ...player, score: player.score + totalTurnScore }
        : player,
    );
  }

  // Prepare clean dice array
  const _dice = dice.map((die) => ({
    ...die,
    value: null,
    isLocked: false,
    isSelected: false,
  }));

  // Calculate the next player ID locally
  let numberPlayers = 0;
  for (const item of players) {
    if (item.name !== "") {
      numberPlayers = numberPlayers + 1;
    }
  }
  
  let nextPlayerID = currentPlayerID;
  if (numberPlayers !== 0) {
    nextPlayerID = (currentPlayerID + 1) % numberPlayers;
  }

  // Push the singular atomic update packet to Firestore
  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    players: updatedPlayers,
    dice: _dice,
    turnScore: 0,
    currentPlayerID: nextPlayerID,
  });
}

  async function rollDice() {
    if (!dice || dice.length === 0) return;

    let newDice = dice.map((die) => ({ ...die }));

    // Score selected dice before locking them from further rolls
    const selectedDice = newDice.filter(
      (die) => die.isSelected && !die.isLocked,
    );
    if (selectedDice.length > 0) {
      await calculateScore(selectedDice);
    }

    // Lock selected dice
    newDice = newDice.map((die) =>
      die.isSelected ? { ...die, isLocked: true, isSelected: false } : die,
    );

    // Check if all locked, reset if so
    // Player used all dice, still alive; reset dice and continue
    if (newDice.every((die) => die.isLocked)) {
      alert("Still alive. Woo hoo!");
      newDice = newDice.map((die) => ({
        ...die,
        value: null,
        isLocked: false,
        isSelected: false,
      }));
    }

    // Roll unlocked dice
    newDice = newDice.map((die) =>
      die.isLocked ? die : { ...die, value: Math.floor(Math.random() * 6) + 1 },
    );

    // setDice(newDice);
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
      dice: newDice,
    });

    // Check for farkle on rolled dice
    const unlockedDice = newDice.filter((die) => !die.isLocked);
    if (unlockedDice.length > 0 && checkForFarkle(unlockedDice)) {
      // alert("Farkle! Turn is over ☹️");
      const audio = new Audio("farkle3.mp3");
      audio.play();

      resetDice(0, true); // Farkle should end turn, so reset dice and turn score but don't add to player score
    }
  }

  function checkForFarkle(dice) {
    // Die objects that are unlocked should be checked for scoring combinations
    // They don't have to be selected to cause a farkle
    // Guard: If all dice are null (i.e. first roll of the turn), can't be a farkle
    const allNull =
      dice.length === 0 || dice.every((die) => die.value === null);
    if (allNull) {
      return false;
    }
    const _dice = dice.filter((die) => !die.isLocked);
    return scoreDice(_dice) === 0;
  }

  // core scoring function; returns score for a given array of die objects
  function calculateScoreValue(dice) {
    // make an object showing number of each dice value in hand, e.g., {1:1, 2:0, 3:1, 4:2, 5:2, 6:0}
    const values = dice.map((d) => d.value);
    const counts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    let score = 0;
    if (Object.values(counts).includes(6)) {
      return { score: 3000, type: "6 of a kind" };
      // if there's 5 of a kind, remove the 5 from the count object to prevent double counting
    } else if (Object.values(counts).includes(5)) {
      Object.keys(counts).forEach((key) => {
        if (counts[key] === 5) {
          delete counts[key];
        }
      });
      score += 2000;
    } else if (
      Object.values(counts).includes(4) &&
      Object.values(counts).includes(2)
    ) {
      return { score: 1500, type: "4 of a kind + pair" };
    } else if (Object.values(counts).includes(4)) {
      Object.keys(counts).forEach((key) => {
        if (counts[key] === 4) {
          delete counts[key];
        }
      });
      score += 1000;
    } else if (
      Object.keys(counts).length === 6 &&
      Object.keys(counts).every((key) => counts[key] === 1)
    ) {
      return { score: 1500, type: "straight" };
    } else if (
      Object.values(counts).filter((count) => count === 3).length === 2
    ) {
      return { score: 2500, type: "two triplets" };
    } else if (
      Object.values(counts).filter((count) => count === 2).length === 3
    ) {
      return { score: 1500, type: "three pairs" };
    } else if (Object.values(counts).includes(3)) {
      const threeKindValue = parseInt(
        Object.keys(counts).find((key) => counts[key] === 3),
      );
      Object.keys(counts).forEach((key) => {
        if (counts[key] === 3) {
          delete counts[key];
        }
      });
      score += threeKindValue === 1 ? 300 : threeKindValue * 100;
    }

    for (let val of values) {
      if (val === 1 && counts[val] < 3) score += 100;
      else if (val === 5 && counts[val] < 3) score += 50;
    }

    return score > 0
      ? { score, type: "partial score" }
      : { score: 0, type: "no score" };
  }

  // Wrapper function to get just the score for farkle checking
  // does not update state, does not log anything, just returns a number
  function scoreDice(dice) {
    const { score } = calculateScoreValue(dice);
    return score;
  }

  // Wrapper function to calculate score and update turnScore state;
  // also logs the new turn score total after scoring
  // score result + state update + console.logs
  async function calculateScore(dice) {
    const { score: rollScore} = calculateScoreValue(dice);

    if (rollScore > 0) {
      const newTurnScore = turnScore + rollScore
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        turnScore: newTurnScore
      });
      return newTurnScore;
    }
  }

  // ----- begin definition of what App component renders to the screen -----
  if (loading) return <p>Loading game room...</p>;

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-start min-h-screen px-4 ">
        <div className="relative h-[80vh] w-[95%] flex flex-col bg-green-700 border-10 rounded-lg">
          <div className="absolute top-4 right-4">
            <Scoreboard players={players} currentPlayerID={currentPlayerID} />
          </div>
          <div className="absolute top-65 right-4">
            <Rollboard turnScore={turnScore} />
          </div>

          <div className="absolute bottom-2 left-1 md:left-2 lg:left-4 flex gap-1 md:gap-4">
            {dice.map((die) => (
              <Die
                key={die.id}
                value={die.value || die.id + 1} // default to [1,2,3,4,5,6]
                isLocked={die.isLocked}
                isSelected={die.isSelected}
                onSelect={async () => {
                  const _dice = dice.map((d) =>
                    d.id === die.id ? { ...d, isSelected: !d.isSelected } : d,
                  );
                  const gameRef = doc(db, "games", gameId);
                  await updateDoc(gameRef, {
                    dice: _dice,
                  });
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={rollDice}
            className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded"
          >
            Roll Dice
          </button>
          <button
            onClick={endTurn}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded"
          >
            End Turn
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded"
          >
            New Game
          </button>
          {showForm ? (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-2 rounded-lg p-2 bg-green-200">
              <NewGame setShowForm={setShowForm} gameId={gameId} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default App;
