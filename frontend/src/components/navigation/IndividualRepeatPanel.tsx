'use client';

interface IndividualRepeatPanelProps {
    repeatCount: number;
    onRepeatCountChange: (count: number) => void;
    currentRepeatCount?: number;
    totalRepeats?: number;
    isActive?: boolean;
}

export default function IndividualRepeatPanel({
                                                  repeatCount,
                                                  onRepeatCountChange,
                                                  currentRepeatCount,
                                                  totalRepeats,
                                                  isActive = false,
                                              }: IndividualRepeatPanelProps) {
    return (
        <div className="text-center mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                🔁 <strong>Repeat Mode Active</strong>
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                Each verse will repeat {repeatCount} times when you click play
            </p>
            <div className="flex justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Repeat count:
                    </label>
                    <select
                        value={repeatCount}
                        onChange={(e) => onRepeatCountChange(Number(e.target.value))}
                        className="px-3 py-1 border border-orange-300 rounded text-sm bg-white dark:bg-gray-800"
                    >
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={3}>3x</option>
                        <option value={5}>5x</option>
                        <option value={7}>7x</option>
                        <option value={10}>10x</option>
                    </select>
                </div>
                {isActive && typeof currentRepeatCount === 'number' && typeof totalRepeats === 'number' && (
                    <div className="text-sm text-orange-600 dark:text-orange-400">
                        Repeat {currentRepeatCount + 1}/{totalRepeats}
                    </div>
                )}
            </div>
        </div>
    );
}