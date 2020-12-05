function getMinimulDistance(costs, settled) {
    var node = null;
    var min = Infinity;
    
    for (var i=0; i<costs.length; i++) {
        if (!settled[i] && (costs[i] < min)) {
            min = costs[i];
            node = i;
        }
    }
    
    return node;
}

function dijkstra(graph, source) {
    initializeAnimations();

    var costs   = [];
    var settled = [];
    var parent  = [];
    
    for (var i=0; i<Object.keys(graph).length; i++) {
        settled.push(false);
        parent.push[i];
        if (i == source) {
            costs.push(0);
        }
        else {
            costs.push(Infinity);
        }
    }
    
    while(settled.includes(false)) {
        var node = getMinimulDistance(costs, settled);
        if (node === null) {
            break;
        }
        var cost = costs[node];
        
        settled[node] = true;
        highlightNode(node, '#96c96e');
        
        var neighbours = graph[node];
        neighbours.forEach(function(neighbour) {
            var head   = parseInt(neighbour[0]);
            var weight = neighbour[1];

            highlightEdge(node, head, 'orange');
            
            if (!settled[head] && (cost + weight < costs[head])) {
                costs[head] = cost + weight;
                parent[head] = node;

                highlightNode(head, 'orange');
            }
        });
    }
}