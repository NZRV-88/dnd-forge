import { ChevronLeft, ChevronRight } from "@/components/refs/icons";
import { useNavigate } from "react-router-dom";

interface StepArrowsProps {
    back?: string;
    next?: string;
}

export default function StepArrows({ back, next }: StepArrowsProps) {
    const nav = useNavigate();

    return (
        <div className="sticky top-32 z-30 w-full max-w-5xl mx-auto pointer-events-none">
            {/* НАЗАД */}
            {back && (
                <button
                    onClick={() => nav(back)}
                    style={{ right: "calc(100% + 16px)" }}
                    className="group absolute top-0
                     w-12 h-12 rounded-md bg-primary/60 shadow-md text-white/70
                     transition-all duration-300 pointer-events-auto
                     hover:w-32 hover:text-white hover:bg-primary overflow-hidden"
                >
                    {/* стрелка фиксирована слева */}
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12">
                        <ChevronLeft className="h-10 w-10 transition-colors duration-300" />
                    </div>

                    {/* текст появляется справа */}
                    <div className="flex items-center h-full pl-12">
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium text-sm whitespace-nowrap text-white/70 group-hover:text-white">
                            НАЗАД
                        </span>
                    </div>
                </button>
            )}

            {/* ДАЛЕЕ */}
            {next && (
                <button
                    onClick={() => nav(next)}
                    style={{ left: "calc(100% + 16px)" }}
                    className="group absolute top-0
                     w-12 h-12 rounded-md bg-primary/60 shadow-md text-white/70
                     transition-all duration-300 pointer-events-auto
                     hover:w-32 hover:text-white hover:bg-primary overflow-hidden"
                >
                    {/* стрелка фиксирована справа */}
                    <div className="absolute inset-y-0 right-0 flex items-center justify-center w-12">
                        <ChevronRight className="h-10 w-10 transition-colors duration-300" />
                    </div>

                    {/* текст появляется слева */}
                    <div className="flex items-center h-full pr-12 justify-end w-full">
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium text-sm whitespace-nowrap text-white/70 group-hover:text-white">
                            ДАЛЕЕ
                        </span>
                    </div>
                </button>
            )}
        </div>
    );
}
