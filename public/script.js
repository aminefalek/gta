import { resetAnimations, queueAnimation, animate } from './animation.js';
import { initializeDFS, DFS } from './algorithms.js';

/*------------------------------ Style ------------------------------*/

var defaultStyle = [
    {
      selector: 'node',
      style: {
        'width': '1.5em',
        'height': '1.5em',
        'border-width': 3,
        'border-color': 'black',
        'background-color': 'black',
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

/*---------------------------- Functions ----------------------------*/

function resetTable() {
    for(var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}

function generateTable() {
    resetTable();
    
    cy.edges().forEach(function(edge) {
        addRow(edge.data('source'), edge.data('target'), edge.data('cost'));
    });
}

function addRow(tail, head, cost) {
    var row = table.insertRow();

    var tailCell = row.insertCell(0);
    var headCell = row.insertCell(1);
    var costCell = row.insertCell(2);
    
    tailCell.appendChild(document.createTextNode(tail));
    headCell.appendChild(document.createTextNode(head));
    costCell.innerHTML = "<input class='col-xs-2' type='number' placeholder='" + cost + "' style='width:100px'>";
}

function getNeighbourIndex(tail, head){
    for (var i=0; i<graph[tail].length; i++) {
        var neighbour = graph[tail][i];
        
        if (neighbour[0] == head) {
            return i;
        }
    }
}

window.updateGraphWeights = function updateGraphWeights() {
    for (var i = 1, row; row = table.rows[i]; i++) {
        var cost = table.rows[i].cells[2].children[0].value;        
        if (cost == '') {
            continue;
        }
        
        var tail = table.rows[i].cells[0].innerHTML;
        var head = table.rows[i].cells[1].innerHTML;
        
        cy.edges().forEach(function(edge) {
            if (edge.data('source') == tail && edge.data('target') == head) {
                edge.data('cost', cost);
                
                var neighbourIndex = getNeighbourIndex(tail, head);
                graph[tail][neighbourIndex][1] = cost;
            }
        });
    }
}

function updateGraph() {
    graph = {};
    
    cy.nodes().forEach(function(node) {
        graph[node.data('id')] = [];
    });
    
    cy.edges().forEach(function(edge) {
        graph[edge.data('source')].push([edge.data('target'), edge.data('cost')]);
    });
}

function render(elements) {
    cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        style: defaultStyle
    });
    cy.layout(options);
    
    cy.on('click', function(cyEvent){
        if (isEditMode) {
            var target = cyEvent.target;
            
            // background click
            if(target === cy){
                try {
                    selectedTailNode.style('background-color', 'black');
                }
                catch (error) {
                    
                }
                selectedNodeCounter = 0;
                cy.add([
                    { group:'nodes', data: { id: nodeId }, renderedPosition: cyEvent.renderedPosition }
                ]);
                
                // add node to graph
                graph[nodeId] = [];
                nodeId++;
            }
            
            // element click (node or edge)
            else {
                
                // Adding an Edge
                if (event.ctrlKey && target.isNode() && selectedNodeCounter == 0) {
                    selectedTailNode = target;
                    selectedTailNode.style('background-color', 'yellow');
                    selectedNodeCounter++;
                }
                
                else if (event.ctrlKey && target.isNode() && selectedNodeCounter == 1) {
                    selectedTailNode.style('background-color', 'black');
                    selectedHeadNode = target;
                    selectedNodeCounter = 0;
                    
                    cy.add([
                        { group:'edges', data: { source: selectedTailNode.id(), target: selectedHeadNode.id(), cost: 1 } }
                    ]);
                    
                    addRow(selectedTailNode.id(), selectedHeadNode.id(), 1);
                    
                    // add edge to graph
                    graph[selectedTailNode.id()].push([selectedHeadNode.id(), 1]);
                }
                
                // Removing an element (node or edge)
                if (event.shiftKey) {
                    cy.remove(cy.$('#' + target.id()));
                    generateTable();
                    updateGraph();
                }
            }      
        }
    });
}

function drawGraph() {
    var elements = [];
    resetTable();
    
    Object.keys(graph).forEach(function(tail) {
        elements.push({group:'nodes', data: { id: tail }});
        graph[tail].forEach(function(neighbour) {
            var head = neighbour[0];
            var cost = neighbour[1];
            
            elements.push({group:'edges', data: { source: tail, target: head, cost: cost }});
            addRow(nodeId, head, cost);
        });
    });
    
    nodeId = Object.keys(graph).length;    
    render(elements);
}

function printGraph() {
    console.log(graph);
} 

async function sendGraphRequest(name) {
    if (name == '') {
        return;
    }
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({'type':'graph', 'name': name})
    };
    
    const response = await fetch('/api', options);
    graph = await response.json();
    drawGraph();
}

async function sendGraphNamesRequest() {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({'type':'graph_names'})
    };
    
    const response = await fetch('/api', options);
    var graphNames = await response.json();
    
    var dropdown = document.getElementById("dropdown");
    
    graphNames.forEach(function(name) {
        var option = document.createElement("option");
        option.text = name;
        dropdown.add(option);
    });
}

window.loadGraph = function loadGraph() {
    var dropdown = document.getElementById("dropdown");
    var graphName = dropdown.options[dropdown.selectedIndex].text;
    
    sendGraphRequest(graphName);
}

window.clearGraph = function clearGraph() {
    cy.elements().remove();
    graph = {};
    nodeId = 0;
}

window.editMode = function editMode() {
    isEditMode = !isEditMode;
    console.log(isEditMode);
}

window.runAlgorithm = function runAlgorithm() {
    resetAnimations();
    initializeDFS(graph, cy);
    DFS(0, []);
    animate();
}

/*------------------------------ Main ------------------------------*/

var graph = {};
var cy;
var isEditMode = false;
var nodeId = 0;
var selectedNodeCounter = 0;
var selectedTailNode;
var selectedHeadNode;
var table = document.getElementById("graph_table");

sendGraphNamesRequest();
render([]);