// src/components/ui/StepArrows.tsx  (замени существующий файл)
import { ChevronLeft, ChevronRight } from "@/components/refs/icons";
import { useNavigate } from "react-router-dom";
import React from "react";

interface StepArrowsProps {
    back?: string;
    next?: string;
    onNext?: () => void | Promise<void | string | boolean>;
    onBack?: () => void | Promise<void | string | boolean>;
}

export default function StepArrows({ back, next, onNext, onBack }: StepArrowsProps) {
    const nav = useNavigate();

    const goNext = async () => {

        if (onNext) {
            try {
                const res = await Promise.resolve(onNext());

                // если onNext вернул строку — считаем это за путь и переходим
                if (typeof res === "string" && res) {
                    nav(res);
                    return;
                }

                // если onNext вернул false — отменяем навигацию
                if (res === false) {
                    return;
                }

                // если onNext вернул undefined/null — предполагаем, что сам onNext сделал навигацию
                // ничего дополнительно не делаем
                return;
            } catch (err) {
                return;
            }
        }

        // если onNext нет — делаем обычный переход по next
        if (next) {
            nav(next);
        }
    };

    const goBack = async () => {

        if (onBack) {
            try {
                const res = await Promise.resolve(onBack());
                if (typeof res === "string" && res) {
                    nav(res);
                    return;
                }
                if (res === false) return;
                return;
            } catch (err) {
                return;
            }
        }

        if (back) nav(back);
    };

    const showPrev = Boolean(onBack || back);
    const showNext = Boolean(onNext || next);

    return (
        <div className="sticky top-32 z-30 w-full max-w-5xl mx-auto pointer-events-none">
            {showPrev && (
                <button
                    onClick={goBack}
                    style={{ right: "calc(100% + 16px)" }}
                    className="group absolute top-0
            w-12 h-12 rounded-md bg-primary/60 shadow-md text-white/70
            transition-all duration-300 pointer-events-auto
            hover:w-32 hover:text-white hover:bg-primary overflow-hidden"
                >
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12">
                        <ChevronLeft className="h-10 w-10 transition-colors duration-300" />
                    </div>
                    <div className="flex items-center h-full pl-12">
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium text-sm whitespace-nowrap text-white/70 group-hover:text-white">
                            НАЗАД
                        </span>
                    </div>
                </button>
            )}

            {showNext && (
                <button
                    onClick={goNext}
                    style={{ left: "calc(100% + 16px)" }}
                    className="group absolute top-0
            w-12 h-12 rounded-md bg-primary/60 shadow-md text-white/70
            transition-all duration-300 pointer-events-auto
            hover:w-32 hover:text-white hover:bg-primary overflow-hidden"
                >
                    <div className="absolute inset-y-0 right-0 flex items-center justify-center w-12">
                        <ChevronRight className="h-10 w-10 transition-colors duration-300" />
                    </div>
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
