import * as Icons from "@/components/refs/icons";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { memo, useMemo } from "react";

function SpellMeta({ spell }: { spell: any }) {
    if (!spell) return null;

    const damageText = useMemo(() => {
        if (!spell.damage) return null;
        if (typeof spell.damage === "string") return spell.damage;
        if (typeof spell.damage === "object") {
            const parts: string[] = [];
            if (spell.damage.amount) parts.push(String(spell.damage.amount));
            if (spell.damage.dice) parts.push(String(spell.damage.dice));
            if (spell.damage.type) parts.push(String(spell.damage.type));
            return parts.join(" ");
        }
        return String(spell.damage);
    }, [spell.damage]);

    const componentsText = useMemo(() => {
        if (!spell.components) return null;
        if (Array.isArray(spell.components)) return spell.components.join(", ");
        if (typeof spell.components === "object") {
            return Object.entries(spell.components)
                .map(([k, v]) => `${k}:${v}`)
                .join(", ");
        }
        return String(spell.components);
    }, [spell.components]);

    return (
        <Card className="bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm border-stone-500">
            <CardHeader className="pb-2">
                <h3 className="text-xl font-bold text-stone-900">{spell.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    {spell.school && (
                        <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-muted/20">
                            <Icons.Star className="h-3 w-3 text-stone-400" />    {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
                        </span>
                    )}
                    {spell.school && (
                        <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-muted/20">
                            <Icons.Book className="h-3 w-3 text-stone-400" />  {spell.school}
                        </span>

                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4 mt-2">
                {/* Мета-информация */}
                <div className="flex flex-wrap gap-2 text-xs">
                    {spell.castingTime && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-stone-200">
                            <Icons.Hourglass className="h-3 w-3 text-stone-400" /> {spell.castingTime}
                        </span>
                    )}
                    {spell.range && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-stone-200">
                            <Icons.Ruler className="h-3 w-3 text-stone-400" /> {spell.range}
                        </span>
                    )}
                    {spell.duration && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-stone-200">
                            <Icons.Clock className="h-3 w-3 text-stone-400" /> {spell.duration}
                        </span>
                    )}
                    {componentsText && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-stone-200">
                            <Icons.FlaskConical className="h-3 w-3 text-stone-400" /> {componentsText}
                        </span>
                    )}
                </div>

                {/* Описание */}
                {spell.desc && (
                    <div className="rounded-md border border-stone-200 bg-gray-100 p-3 text-sm leading-relaxed text-stone-800">
                        <ReactMarkdown>{spell.desc}</ReactMarkdown>
                    </div>
                )}

                {/* Доп. инфа */}
                <div className="flex flex-wrap gap-2 text-xs">
                    {spell.save && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-stone-200">
                            <Icons.Shield className="h-3 w-3 text-stone-400" /> Спасбросок: {spell.save}
                        </span>
                    )}
                    {damageText && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-stone-200">
                            {(() => {
                                const Icon = Icons.getDamageIcon(
                                    typeof spell.damage === "object" ? spell.damage.type : spell.damage
                                );
                                return <Icon className="h-3 w-3 text-stone-400" />;
                            })()}{" "}
                            Урон: {damageText}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default memo(SpellMeta);
