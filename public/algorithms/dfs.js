import { initializeAnimations, queueAnimation, highlightNode, highlightEdge } from '../animation.js';

var graph, cy;

export function initializeDFS(graph_, cy_) {
    initializeAnimations(cy_);
    graph = graph_;
    cy = cy_;
}

export function DFS(root, visited) {
    if (visited.includes(root)) {
        return;
    }
    
    console.log(visited);
    
    highlightNode(root, 'red');
    visited.push(root);
    var neighbours = graph[root];
    
    neighbours.forEach(function(neighbour) {
        var head   = neighbour[0];
        
        if (!visited.includes(head)) {
            highlightEdge(root, head, 'red');
        }
        
        DFS(head, visited);
    });
}