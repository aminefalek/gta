import { initializeAnimations, queueAnimation } from '../animation.js';

var graph, cy;
var duration;

export function initialize(graph_, cy_, duration_) {
    initializeAnimations(cy_, duration_);
    graph = graph_;
    cy = cy_;
    duration = duration_;
}

export function DFS(root, visited) {
    if (visited.includes(root)) {
        return;
    }
    
    addAnimation(root);
    visited.push(root);
    var neighbours = graph[root];
    
    neighbours.forEach(function(neighbour) {
        var head = neighbour[0];
        DFS(head, visited);
    });
}

function addAnimation(id) {
    var animF = cy.$('#' + id).animation({
                        style: {
                            'background-color': 'yellow'
                        }
                    }, {
                        duration: duration,
                    });
    
    var animB = cy.$('#' + id).animation({
                        style: {
                            'background-color': 'black'
                        }
                    });
    
    queueAnimation(animF, animB);
}