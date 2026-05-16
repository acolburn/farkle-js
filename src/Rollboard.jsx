function Rollboard({ turnScore }) {
  return (
    <div className="p-4 w-1/5 min-w-48">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left text-gray-200 font-bold">
              This Roll
            </th>
          </tr>
        </thead>
        <tbody>
          
            <tr>
              <td className="border border-gray-300 text-gray-200 px-4 py-2">
                {turnScore}
              </td>
            </tr>
          
        </tbody>
      </table>
    </div>
  );
}

export default Rollboard;
