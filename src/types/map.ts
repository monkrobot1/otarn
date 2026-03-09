export type NodeType = 'combat' | 'event' | 'rest' | 'shop' | 'elite' | 'boss';

export interface MapNode {
  id: string;
  type: NodeType;
  x: number; // For visualization, 0-100% representation
  y: number; // 0-100% 
  connections: string[]; // Node IDs that this connects to
  level?: number; // Pre-calculated encounter level difficulty
}
