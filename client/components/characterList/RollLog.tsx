type RollLogProps = {
  rolls: string[];
  show: boolean;
  onToggle: () => void;
};

export default function RollLog({ rolls, show, onToggle }: RollLogProps) {
  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={onToggle}
        className="bg-yellow-600 text-white px-4 py-2 rounded"
      >
        {show ? "Скрыть лог" : "Показать лог"}
      </button>

      {show && (
        <div className="mt-2 w-64 max-h-64 overflow-y-auto border border-yellow-600 bg-neutral-800 rounded p-2 text-sm">
          {rolls.length === 0 ? (
            <div className="text-gray-400">Лог пуст</div>
          ) : (
            rolls.map((r, i) => (
              <div key={i} className="text-yellow-300">
                {r}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
