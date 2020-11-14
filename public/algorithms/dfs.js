import { queueAnimation, highlightNode, highlightEdge } from '../animation.js';

export function dfs(graph, cy, root, visited) {
    if (visited.includes(root)) {
        return;
    }
    
    highlightNode(root, 'red');
    visited.push(root);
    var neighbours = graph[root];
    
    neighbours.forEach(function(neighbour) {
        var head   = neighbour[0];
        
        if (!visited.includes(head)) {
            highlightEdge(root, head, 'red');
        }
        
        dfs(graph, cy, head, visited);
    });
}