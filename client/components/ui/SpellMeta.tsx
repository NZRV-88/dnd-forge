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
        <Card className="bg-gradient-to-b from-muted/20 to-background shadow-md">
            <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">

                <h3 className="text-lg font-bold">{spell.name}</h3>
                <p className="text-sm text-muted-foreground">
                    {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {spell.school && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            <Icons.Book className="h-4 w-4 text-muted-foreground" />
                            <span><span className="font-medium">Школа:</span> {spell.school}</span>
                        </div>
                    )}
                    {spell.castingTime && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            <Icons.Hourglass className="h-4 w-4 text-muted-foreground" />
                            <span><span className="font-medium">Время:</span> {spell.castingTime}</span>
                        </div>
                    )}
                    {spell.duration && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            <Icons.Clock className="h-4 w-4 text-muted-foreground" />
                            <span><span className="font-medium">Длительность:</span> {spell.duration}</span>
                        </div>
                    )}
                    {spell.range && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            <Icons.Ruler className="h-4 w-4 text-muted-foreground" />
                            <span><span className="font-medium">Дальность:</span> {spell.range}</span>
                        </div>
                    )}
                    {spell.area && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            <Icons.Footprints className="h-4 w-4 text-muted-foreground" />
                            <span><span className="font-medium">Область:</span> {spell.area}</span>
                        </div>
                    )}
                    {componentsText && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            <Icons.FlaskConical className="h-4 w-4 text-muted-foreground" />
                            <span><span className="font-medium">Компоненты:</span> {componentsText}</span>
                        </div>
                    )}
                    {spell.save && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            <Icons.Shield className="h-4 w-4 text-muted-foreground" />
                            <span><span className="font-medium">Спасбросок:</span> {spell.save}</span>
                        </div>
                    )}
                    {damageText && (
                        <div className="flex items-center gap-2 rounded border p-2">
                            {(() => {
                                const Icon = Icons.getDamageIcon(
                                    typeof spell.damage === "object" ? spell.damage.type : spell.damage
                                );
                                return <Icon className="h-4 w-4 text-muted-foreground" />;
                            })()}
                            <span><span className="font-medium">Урон:</span> {damageText}</span>
                        </div>
                    )}
                </div>

                {spell.desc && (
                    <div className="rounded border bg-muted/10 p-2">
                        <ReactMarkdown>{spell.desc}</ReactMarkdown>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default memo(SpellMeta);
