export const perfLog = (component: string, msThreshold: number = 3) => {
    let lastTime = performance.now();
    return (label: string) => {
        const now = performance.now();
        const diff = now - lastTime;
        if (diff > msThreshold) {
            console.warn(`[WARN - PERF] ${component} - ${label} took ${diff.toFixed(2)}ms`);
        }
        lastTime = now;
    };
};
