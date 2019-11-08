function render(elements) {
    var cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        style: defaultStyle
    });
    
    cy.layout(options);
    
    cy.on('click', function(e){
        if (event.ctrlKey) {
            if (selectedNodeCounter == 0) {
                selectedTailNode = e.target;
                selectedTailNode.style('border-color', 'red');
                selectedNodeCounter++;
            }
            else {
                selectedTailNode.style('border-color', '#000');
                selectedHeadNodeNode = e.target;
                selectedNodeCounter = 0;
                
                cy.add([
                    { group:'edges', data: { id: selectedTailNode.id().toString() + selectedHeadNodeNode.id().toString(), cost: 1, source: selectedTailNode.id(), target: selectedHeadNodeNode.id() } }
                ]);
                
            }
        }
        else {
            console.log('normal mode');
            selectedNodeCounter = 0;
            cy.add([
                { group:'nodes', data: { id: nodeId++ }, renderedPosition: e.renderedPosition }
            ]);
        }
        
    });
    
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
    
    for (nodeId=0; nodeId<graph.length; nodeId++) {
        addNode(elements, nodeId);
        for (var j=0; j<graph[nodeId].length; j++) {
            var head = graph[nodeId][j][0];
            var cost = graph[nodeId][j][1];
            
            addEdge(elements, nodeId, head, cost);
        }
    }
    
    cy = render(elements);
    return cy
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
var nodeId = 0;
var selectedNodeCounter = 0;
var selectedTailNode;
var selectedHeadNode;

var defaultStyle = [
    {
      selector: 'node',
      style: {
        'width': '1.5em',
        'height': '1.5em',
        'border-width': 3,
        'border-color': 'black',
        'background-color': 'yellow',
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
  nodeSep: 20,
  idealEdgeLength: 10
};