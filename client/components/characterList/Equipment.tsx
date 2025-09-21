import React from "react";

type Props = {
  items: string[];
};

export default function Equipment({ items }: Props) {
  return (
    <div className="border border-yellow-600 rounded-lg p-4 mb-4 bg-neutral-800">
      <h2 className="text-xl font-serif text-yellow-400 mb-2">Снаряжение</h2>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
