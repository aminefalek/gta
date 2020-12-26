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

    var targets = [];
    
    for (var i=0; i<Object.keys(graph).length; i++) {
        settled.push(false);
        parent.push[i];
        if (i == source) {
            costs.push(0);
        }
        else {
            costs.push(Infinity);
            targets.push(i);
        }
    }

    anim_display_label([source], 0);
    anim_display_label(targets, Infinity);
    
    while(settled.includes(false)) {
        var node = getMinimulDistance(costs, settled);
        if (node === null) {
            break;
        }
        var cost = costs[node];
        
        settled[node] = true;
        anim_highlight_node(node, '#96c96e');
        anim_display_label([node], cost);
        
        var neighbours = graph[node];
        neighbours.forEach(function(neighbour) {
            var head   = parseInt(neighbour[0]);
            var weight = neighbour[1];

            anim_highlight_edge(node, head, 'orange');
            
            if (!settled[head] && (cost + weight < costs[head])) {
                costs[head] = cost + weight;
                parent[head] = node;

                anim_highlight_node(head, 'orange');
                anim_display_label([head], cost);
            }
        });
    }
}