function Scoreboard({ players, currentPlayerID }) {
  // Convert the object values into an array safely
  const playersArray = players ? Object.values(players) : [];

  return (
    <div className="p-4 w-1/5 min-w-48">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-200">Player</th>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-200">Score</th>
          </tr>
        </thead>
        <tbody>
          {playersArray.map((player) => (
            <tr key={player.id}>
              <td className={`border border-gray-300 text-gray-200 px-4 py-2 ${player.id === currentPlayerID ? "font-bold" : ""}`}>
                {player.name}
              </td>
              <td className="border border-gray-300 text-gray-200 px-4 py-2">
                {player.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Scoreboard;
