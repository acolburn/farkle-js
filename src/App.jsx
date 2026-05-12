import { useState } from "react";
import Header from "./Header";
import Scoreboard from "./Scoreboard";
import Die from "./Die";
import Rollboard from "./Rollboard";

function App() {
  const [dice, setDice] = useState(
    Array.from({ length: 6 }, (_, id) => ({
      id,
      value: null,
      isLocked: false,
      isSelected: false,
    })),
  );
  const [turnScore, setTurnScore] = useState([]);
  const [players, setPlayers] = useState([
    { name: "player1", score: 0 },
    { name: "player2", score: 0 },
    { name: "player3", score: 0 },
    { name: "player4", score: 0 },
  ]);

  function endTurn() {
    let score = 0;
    if (!dice || dice.length === 0) return;

    // Die objects that are selected and unlocked should be scored
    // const _dice = dice.filter((die) => die.isSelected && !die.isLocked);
    // Die objects that are selected should be scored (locked dice can't included, so previous code was redundant)
    const _dice = dice.filter((die) => die.isSelected);

    if (_dice.length > 0) {
      // Unlikely event player selected dice that don't score...
      if (checkForFarkle(_dice)) {
        alert("Farkle! No points scored this turn.");
        resetDice(0);
        return;
      } else {
        score = calculateScore(_dice);
        console.log("Value of selected dice when you clicked End Turn:", score);
      }
    }
    resetDice(score);
  }

  // resets dice to initial state, adds turn score to player 1's total score, resets turn score to 0
  function resetDice(score) {
    // sometimes score values are NaN
    // if player farkled, score will be 0, so turn score should reset to 0 and not add to player score
    const totalTurnScore =
      score === 0
        ? 0
        : (turnScore.reduce((total, s) => total + s, 0) || 0) + (score || 0);

    // Update player 1's score
    setPlayers(
      players.map((player) =>
        player.name === "player1"
          ? { ...player, score: player.score + totalTurnScore }
          : player,
      ),
    );

    // Reset dice
    setDice(
      dice.map((die) => ({
        ...die,
        value: null,
        isLocked: false,
        isSelected: false,
      })),
    );
    // Reset turn score
    setTurnScore([]);
    console.log("Turn score reset to:", 0);
  }

  function rollDice() {
    if (!dice || dice.length === 0) return;

    let newDice = dice.map((die) => ({ ...die }));

    // Score selected dice before locking them from further rolls
    const selectedDice = newDice.filter(
      (die) => die.isSelected && !die.isLocked,
    );
    if (selectedDice.length > 0) {
      calculateScore(selectedDice);
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

    setDice(newDice);

    // Check for farkle on rolled dice
    const unlockedDice = newDice.filter((die) => !die.isLocked);
    if (unlockedDice.length > 0 && checkForFarkle(unlockedDice)) {
      alert("Farkle! Turn is over ☹️");
      resetDice(0); // Farkle should end turn, so reset dice and turn score but don't add to player score
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
    const values = dice.map((d) => d.value);
    const counts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    let score = 0;
    if (Object.values(counts).includes(6)) {
      return { score: 3000, type: "6 of a kind" };
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
  function calculateScore(dice) {
    const { score, type } = calculateScoreValue(dice);

    if (score > 0) {
      setTurnScore((prev) => [...prev, score]);
      let t = turnScore.reduce((total, s) => total + s, 0);
      t += score;
      if (type === "6 of a kind") {
        console.log("Turn score total after 6 of a kind:", t);
      } else if (type === "4 of a kind + pair") {
        console.log("Turn score total after 4 of a kind + pair:", t);
      } else if (type === "straight") {
        console.log("Turn score total after straight:", t);
      } else if (type === "two triplets") {
        console.log("Turn score total after two triplets:", t);
      } else if (type === "three pairs") {
        console.log("Turn score total after three pairs:", t);
      } else if (type === "partial score") {
        console.log("Turn score total after scoring:", t);
      }
    }
    return score;
  }

  // ----- begin definition of what App component renders to the screen -----
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-start min-h-screen px-4 ">
        <div className="relative h-[80vh] w-[95%] flex flex-col bg-green-700 border-10 rounded-lg">
          <div className="absolute top-4 right-4">
            <Scoreboard players={players} />
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
                onSelect={() => {
                  // toggle isSelected for this die
                  setDice((prevDice) =>
                    prevDice.map((d) =>
                      d.id === die.id ? { ...d, isSelected: !d.isSelected } : d,
                    ),
                  );
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
        </div>
      </div>
    </>
  );
}

export default App;
