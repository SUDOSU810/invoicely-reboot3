import { cn } from "@/lib/utils"

interface SliderProps {
    value: number
    onValueChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    className?: string
}

export function Slider({
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    className
}: SliderProps) {
    return (
        <input
            type="range"
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className={cn(
                "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4",
                "slider-thumb:rounded-full slider-thumb:bg-blue-500 slider-thumb:cursor-pointer",
                "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
                "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500",
                "[&::-webkit-slider-thumb]:cursor-pointer",
                "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
                "[&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer",
                "[&::-moz-range-thumb]:border-none",
                className
            )}
        />
    )
}