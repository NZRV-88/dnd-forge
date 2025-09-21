import React from "react";
import { ALL_FEATS } from "@/data/feats";

type Props = {
  feats: Record<string, any>;
};

export default function Features({ feats }: Props) {
  return (
    <div className="border border-yellow-600 rounded-lg p-4 mb-4 bg-neutral-800">
      <h2 className="text-xl font-serif text-yellow-400 mb-2">Особенности / Черты</h2>
      <div className="space-y-2 text-sm">
        {Object.values(feats || {}).map((s: any, idx: number) => {
          if (s?.mode === "feat" && s.feat) {
            const feat = ALL_FEATS.find((f) => f.key === s.feat);
            if (!feat) return null;
            return (
              <div key={idx} className="p-2 border border-neutral-700 rounded bg-neutral-900">
                <div className="font-bold text-yellow-300">{feat.name}</div>
                <div className="text-gray-300">{feat.desc}</div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
