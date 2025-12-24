// Internal types for generators

export type TruchetTileType = 'arc-a' | 'arc-b' | 'diagonal-a' | 'diagonal-b' | 'straight-a' | 'straight-b' | 'zigzag-a' | 'zigzag-b';

// Tile connectivity definitions
// Edges: N=0, E=1, S=2, W=3
// Each tile connects pairs of edges
export const TILE_CONNECTIONS: Record<TruchetTileType, [number, number][]> = {
    'arc-a': [[0, 1], [2, 3]],      // N↔E, S↔W (quarter arcs)
    'arc-b': [[0, 3], [1, 2]],      // N↔W, E↔S (mirrored arcs)
    'diagonal-a': [[0, 1], [2, 3]], // N↔E, S↔W (diagonal lines)
    'diagonal-b': [[0, 3], [1, 2]], // N↔W, E↔S (diagonal lines mirrored)
    'straight-a': [[0, 2]],         // N↔S (vertical through-line)
    'straight-b': [[1, 3]],         // E↔W (horizontal through-line)
    'zigzag-a': [[0, 1], [2, 3]],   // N↔E, S↔W but with stepped zigzag
    'zigzag-b': [[0, 3], [1, 2]],   // N↔W, E↔S but with stepped zigzag
};

// Get opposite edge (for neighbor matching)
export const getOppositeEdge = (edge: number): number => (edge + 2) % 4;

// Check if tile has connection at specified edge
export const hasEdgeConnection = (tileType: TruchetTileType, edge: number): boolean => {
    const connections = TILE_CONNECTIONS[tileType];
    return connections.some(([a, b]) => a === edge || b === edge);
};
