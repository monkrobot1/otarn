export type NodeType = 'combat' | 'elite' | 'event' | 'rest' | 'boss' | 'shop';

export interface MapNode {
  id: string;
  type: NodeType;
  x: number; // 0-100 percentages horizontally
  y: number; // 0-100 percentages vertically
  connections: string[]; // IDs of children
}
