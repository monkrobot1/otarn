import type { MapNode, NodeType } from '../types/map';

const COLS = 10;
const ROWS_MIN = 3;
const ROWS_MAX = 5;

// Utility for rng
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMap = (debugEventsOnly: boolean = false): MapNode[] => {
    const nodes: MapNode[][] = []; // grouped by column

    // Step 1: Generate Nodes Per Column
    for (let c = 0; c < COLS; c++) {
        const colNodes: MapNode[] = [];
        
        let nodeCount = randomInt(ROWS_MIN, ROWS_MAX);
        if (c === 0) nodeCount = randomInt(3, 4); // Start with 3 or 4 points
        if (c === COLS - 1) nodeCount = 1; // Boss col
        
        const xPos = 10 + (c * (180 / (COLS - 1))); // from 10 to 190 on a 200-width box
        
        for (let r = 0; r < nodeCount; r++) {
            const yPercent = 10 + (r * (80 / (nodeCount - 1 || 1))) + randomInt(-5, 5); // Add slight organic jitter
            
            // Assign type
            let type: NodeType = 'combat';
            
            if (debugEventsOnly) {
                type = (c === COLS - 1) ? 'boss' : (c === COLS - 2 ? 'rest' : 'event');
            } else {
                if (c === COLS - 1) {
                    type = 'boss';
                } else if (c === COLS - 2) {
                    type = 'rest';
                } else if (c === 0) {
                    type = Math.random() > 0.5 ? 'combat' : 'event'; // safe start
                } else {
                    const roll = Math.random();
                    if (roll < 0.2) type = 'elite';
                    else if (roll < 0.3) type = 'rest';
                    else if (roll < 0.45) type = 'shop';
                    else if (roll < 0.6) type = 'event';
                    else type = 'combat';
                }
            }
            
            colNodes.push({
                id: `node_c${c}_r${r}`,
                type,
                x: xPos,
                y: c === COLS - 1 ? 50 : Math.min(Math.max(yPercent, 10), 90), // Boss at 50, others bounded 10-90
                connections: []
            });
        }
        nodes.push(colNodes);
    }
    
    // Step 1.5: Enforce constraints (minimum 2 shops)
    if (!debugEventsOnly) {
        let shopCount = 0;
        const eligibleNodes: MapNode[] = [];
        
        for (let c = 1; c < COLS - 2; c++) {
            nodes[c].forEach(node => {
                if (node.type === 'shop') shopCount++;
                else eligibleNodes.push(node);
            });
        }
        
        while (shopCount < 2 && eligibleNodes.length > 0) {
            const index = randomInt(0, eligibleNodes.length - 1);
            const node = eligibleNodes.splice(index, 1)[0];
            node.type = 'shop';
            shopCount++;
        }
    }

    // Step 2: Establish base connections (Forward & Backward guarantee)
    for (let c = 0; c < COLS - 1; c++) {
        const currentCol = nodes[c];
        const nextCol = nodes[c + 1];
        
        // Strategy: 
        // 1. Give every node in currentCol at least 1 connection to nextCol.
        // 2. Give every node in nextCol at least 1 incoming connection from currentCol.
        
        // 1. Every currentCol node goes right
        currentCol.forEach((node, i) => {
            // Find closest index proportionally in nextCol
            const proportionalIdx = Math.floor((i / currentCol.length) * nextCol.length);
            
            let possibleTargets = [nextCol[proportionalIdx]];
            if (proportionalIdx > 0) possibleTargets.push(nextCol[proportionalIdx - 1]);
            if (proportionalIdx < nextCol.length - 1) possibleTargets.push(nextCol[proportionalIdx + 1]);
            
            const target = randomChoice(possibleTargets);
            if (!node.connections.includes(target.id)) {
                node.connections.push(target.id);
            }
        });
        
        // 2. Every nextCol node must come from somewhere
        nextCol.forEach((target, j) => {
            const incomingCount = currentCol.filter(n => n.connections.includes(target.id)).length;
            if (incomingCount === 0) {
                const proportionalIdx = Math.floor((j / nextCol.length) * currentCol.length);
                let possibleSources = [currentCol[proportionalIdx]];
                if (proportionalIdx > 0) possibleSources.push(currentCol[proportionalIdx - 1]);
                if (proportionalIdx < currentCol.length - 1) possibleSources.push(currentCol[proportionalIdx + 1]);
                
                const source = randomChoice(possibleSources);
                source.connections.push(target.id);
            }
        });
        
        // Optional 3. Add random extra branches for fun? 
        // (Just ensure paths don't look completely straight)
        currentCol.forEach((node) => {
           if (Math.random() < 0.3 && nextCol.length > 1) { // 30% chance of extra branch
               const target = randomChoice(nextCol);
               if (!node.connections.includes(target.id)) {
                   node.connections.push(target.id);
               }
           } 
        });
    }

    // Step 3: Flatten
    const flatMap: MapNode[] = [];
    nodes.forEach(col => flatMap.push(...col));

    return flatMap;
}
