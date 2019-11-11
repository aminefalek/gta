import { queueAnimation } from './animation.js';

var graph, cy;

export function initializeDFS(graph_, cy_) {
    graph = graph_;
    cy = cy_;
}

export function DFS(root, visited) {
    if (visited.includes(root)) {
        return;
    }
    
    queueAnimation(cy, root);
    visited.push(root);
    var neighbours = graph[root];
    
    neighbours.forEach(function(neighbour) {
        var head = neighbour[0];
        DFS(head, visited);
    });
}