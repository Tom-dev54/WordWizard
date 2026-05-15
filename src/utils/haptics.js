export const tap = () => navigator.vibrate?.(10)
export const impact = () => navigator.vibrate?.([15, 10, 15])
export const success = () => navigator.vibrate?.([10, 50, 10])
