import React from "react";

type Props = {
  attacks: { name: string; bonus: number; damage: string }[];
};

export default function Attacks({ attacks }: Props) {
  return (
    <div className="border border-yellow-600 rounded-lg p-4 mb-4 bg-neutral-800">
      <h2 className="text-xl font-serif text-yellow-400 mb-2">Атаки</h2>
      <div className="space-y-2 text-sm">
        {attacks.map((atk, i) => (
          <div key={i} className="flex justify-between border-b border-neutral-700 py-1">
            <span>{atk.name}</span>
            <span>{atk.bonus >= 0 ? `+${atk.bonus}` : atk.bonus}</span>
            <span>{atk.damage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
