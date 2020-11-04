const navbar        = document.getElementById("navbar");
const control       = document.getElementById("control");
const sidebarLeft   = document.getElementById("sidebar-left");
const sidebarRight  = document.getElementById("sidebar-right");
const collapseLeft  = document.getElementById("collapse-left");
const collapseRight = document.getElementById("collapse-right");
const content       = document.getElementById('content');
const runButton     = document.getElementById('run-button');

const codeMirror = CodeMirror(navbar, {
    value:"def example():\n\tprint(\"Hello, world!\")\n\nexample()",
    mode: "python",
    theme: "monokai",
    lineNumbers:true
});
codeMirror.setSize("100%", "100%");

// Toggle run/pause button icon in control panel
runButton.onclick = function() {
    runButton.firstChild.classList.toggle('fa-pause');
};

// Toggle right sidebar with transition animation
collapseRight.onclick = function() {
    var offset = window.innerWidth - (sidebarRight.offsetLeft + sidebarRight.clientWidth);
    if (offset < 0) {
        sidebarRight.style.marginRight = '0px';
    }
    else {
        sidebarRight.style.marginRight = -sidebarRight.clientWidth + 'px';
    }
};

// Toggle left sidebar with transition animation
collapseLeft.onclick = function() {
    sidebarLeft.classList.add('transition');
    if (sidebarLeft.offsetLeft < 0) {
        sidebarLeft.style.marginLeft = '0px';
    } 
    else {
        sidebarLeft.style.marginLeft = -sidebarLeft.clientWidth + 'px';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const resizable = function(resizer) {
        const direction   = resizer.getAttribute('data-direction') || 'horizontal';
        var side1, side2;

        if (direction === 'vertical') {
            side1 = navbar;
            side2 = control;
        } else {
            side1 = sidebarLeft;
            side2 = content;
        }

        // The current position of mouse
        let x = 0;
        let y = 0;
        let side1Height = 0;
        let side1Width  = 0;

        // Handle the mousedown event
        const mouseDownHandler = function(e) {
            // Disable transition animation when manually resizing sidebar
            sidebarLeft.classList.remove('transition');

            // Get the current mouse position
            x = e.clientX;
            y = e.clientY;
            const rect = side1.getBoundingClientRect();
            side1Height = rect.height;
            side1Width  = rect.width;

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function(e) {
            const dx = e.clientX - x;
            const dy = e.clientY - y;

            switch (direction) {
                case 'vertical':
                    const h = (side1Height + dy) * 100 / resizer.parentNode.getBoundingClientRect().height;
                    side1.style.height = `${h}%`;
                    break;
                case 'horizontal':
                default:
                    const w = (side1Width + dx) * 100 / resizer.parentNode.getBoundingClientRect().width;
                    side1.style.width = `${w}%`;
                    break;
            }

            const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
            resizer.style.cursor = cursor;
            document.body.style.cursor = cursor;

            side1.style.userSelect = 'none';
            side1.style.pointerEvents = 'none';

            side2.style.userSelect = 'none';
            side2.style.pointerEvents = 'none';
        };

        const mouseUpHandler = function() {
            resizer.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');

            side1.style.removeProperty('user-select');
            side1.style.removeProperty('pointer-events');

            side2.style.removeProperty('user-select');
            side2.style.removeProperty('pointer-events');

            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        // Attach the handler
        resizer.addEventListener('mousedown', mouseDownHandler);
    };

    // Query all resizers
    document.querySelectorAll('.resizer').forEach(function(ele) {
        resizable(ele);
    });
});

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
        container: document.getElementById('content'),
        elements: elements,
        style: defaultStyle
    });
    cy.layout(options);
    
    cy.on('click', function(cyEvent){
        if (isEditMode) {
            var target = cyEvent.target;
            
            // background click
            if(target === cy){
                if (selectedNodeCounter > 0) {
                    selectedTailNode.style('background-color', 'black');
                }
                
                else {
                    cy.add([
                    { group:'nodes', data: { id: nodeId }, renderedPosition: cyEvent.renderedPosition }
                    ]);

                    // add node to graph
                    graph[nodeId] = [];
                    nodeId++;
                }
                selectedNodeCounter = 0;
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
                    if (selectedNodeCounter > 0) {
                        selectedTailNode.style('background-color', 'black');
                        selectedNodeCounter = 0;
                    }
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
            var head   = neighbour[0];
            var cost   = neighbour[1];
            
            elements.push({group:'edges', data: { source: tail, target: head, cost: cost }});
            addRow(tail, head, cost);
        });
    });
    
    nodeId = Object.keys(graph).length;    
    render(elements);
}

window.loadGraph = function loadGraph() {
    var dropdown = document.getElementById("dropdown");
    var graphName = dropdown.options[dropdown.selectedIndex].text;
    
    sendGraphRequest(graphName);
}

window.clearGraph = function clearGraph() {
    cy.elements().remove();
    graph = {};
    resetTable();
    nodeId = 0;
}

window.editMode = function editMode() {
    isEditMode = !isEditMode;
}

var graph = {};
var cy;
var isEditMode = false;
var nodeId = 0;
var selectedNodeCounter = 0;
var selectedTailNode;
var selectedHeadNode;
var table = document.getElementById("graph_table");

render([]);