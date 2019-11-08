function render(elements) {
    var cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        style: defaultStyle
    });
    
    cy.layout(options);
    
    return cy;
}

function addNode(elements, node) {
    elements.push({data: { id: node }});
}

function addEdge(elements, tail, head, cost) {
    elements.push({data: { id: tail.toString() + head.toString(), cost: cost, source: tail, target: head }});
}

function drawGraph(graph) {
    var elements = [];
    
    for (var i=0; i<graph.length; i++) {
        addNode(elements, i);
        for (var j=0; j<graph[i].length; j++) {
            var head = graph[i][j][0];
            var cost = graph[i][j][1];
            
            addEdge(elements, i, head, cost);
        }
    }
    
    render(elements);    
}

async function sendGraphRequest(name) {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({'name': name})
    };
    
    const response = await fetch('/api', options);
    var graph = await response.json();
    drawGraph(graph);
        
    return graph;
}

var graph = sendGraphRequest('basic');


var defaultStyle = [
    {
      selector: 'node',
      style: {
        'background-color': '#000',
        'label': 'data(id)'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'color': 'grey',
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'vee',
        'label': 'data(cost)',
        'curve-style': 'bezier',
        'text-margin-y': -10
      }
    }
];

let options = {
  name: 'cose',
  animate: false,
  idealEdgeLength: 10
};