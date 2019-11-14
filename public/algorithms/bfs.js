import { queueAnimation, highlightNode, highlightEdge } from '../animation.js';

function enqueue(queue, element) {
    queue.push(element);
}

function dequeue(queue) {
    var head = queue[0];
    queue.shift();
    return head;
}

export function bfs(graph, cy, root) {
    
    var visited = [];
    var queue = [root];
    
    while (queue.length > 0) {
        var node = dequeue(queue);
        visited.push(node);
        
        highlightNode(node, 'red');
        var neighbours = graph[node];        
        neighbours.forEach(function(neighbour) {
            var head = neighbour[0];

            if (!visited.includes(head)) {
                highlightEdge(node, head, 'red');
                enqueue(queue, head);
            }
        });
    }
}