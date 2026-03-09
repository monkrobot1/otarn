export const createLog = (name: string) => {
    let start = performance.now();
    return {
        check: (label: string) => {
            const now = performance.now();
            const diff = now - start;
            if (diff > 5) {
                console.log(`[PERF DEV] ${name} - ${label}: ${diff.toFixed(2)}ms`);
            }
            start = performance.now();
        }
    }
}
