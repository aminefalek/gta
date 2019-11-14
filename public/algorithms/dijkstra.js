import { initializeAnimations, queueAnimation, highlightNode, highlightEdge } from '../animation.js';

var graph, cy;

export function initializeDijkstra(graph_, cy_) {
    initializeAnimations(cy_);
    graph = graph_;
    cy = cy_;
}

function getMinimulDistance(distance, settled) {
    var node = null;
    var min = Infinity;
    
    for (var i=0; i<distance.length; i++) {
        if (!settled[i] && (distance[i] < min)) {
            min = distance[i];
            node = i;
        }
    }
    
    return node;
}

export function dijkstra(source) {
    var distance = [];
    var settled = [];
    var parent   = [];
    
    for (var i=0; i<Object.keys(graph).length; i++) {
        settled.push(false);
        parent.push[i];
        if (i == source) {
            distance.push(0);
        }
        else {
            distance.push(Infinity);
        }
    }
    
    while(settled.includes(false)) {        
        var node = getMinimulDistance(distance, settled);
        var dist = distance[node];
        
        settled[node] = true;
        highlightNode(node, '#96c96e');
        
        var neighbours = graph[node];
        console.log(node, neighbours);
        neighbours.forEach(function(neighbour) {
            var head   = neighbour[0];
            var weight = neighbour[1];
            
            if (!settled[head] && (dist + weight < distance[head])) {
                distance[head] = dist + weight;
                parent[head] = node;
                
                highlightNode(head, 'orange');
            }
        });
    }
}