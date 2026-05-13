function Scoreboard({ players }) {
  return (
    <div className="p-4 w-1/5 min-w-48">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-200">
              Player
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-200">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Object.entries(players) converts props object into an array of [key, value] pairs */}
          {players.map((player) => (
            <tr key={player.id}>
              <td className="border border-gray-300 text-gray-200 px-4 py-2">
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
