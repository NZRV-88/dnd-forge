export {
    Sword,
    Heart,
    Brain,
    Book,
    Eye,
    Star,
    Crown,
    Flame,
    Snowflake,
    Zap,
    Skull,
    FlaskConical,
    Footprints,
    Ruler,
    Hourglass,
    Languages,
    X,
    Shield,
    Clock,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ArrowUp,
    ArrowRight,
    Wind,
    Award,
} from "lucide-react";

import * as Icons from "@/components/refs/icons";

export function getDamageIcon(damageType: string) {
    switch (damageType) {
        case "Огонь":
            return Icons.Flame;
        case "Холод":
            return Icons.Snowflake;
        case "Молния":
            return Icons.Zap;
        case "Яд":
            return Icons.Skull;
        case "Кислота":
            return Icons.FlaskConical;
        default:
            return Icons.Flame;
    }
}
