const navbar        = document.getElementById("navbar");
const control       = document.getElementById("control");
const sidebarLeft   = document.getElementById("sidebar-left");
const sidebarRight  = document.getElementById("sidebar-right");
const collapseLeft  = document.getElementById("collapse-left");
const collapseRight = document.getElementById("collapse-right");
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
            side2 = sidebarLeft;
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

var cyStyle = [
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
        'color': '#666666',
        'line-color': '#666666',
        'target-arrow-color': '#666666',
        'target-arrow-shape': 'triangle',
        'label': 'data(cost)',
        'curve-style': 'bezier',
        'text-margin-y': -10
      }
    },
    {
        selector: ".eh-handle",
        style: {
            "background-color": "#ff6347",
            content: "",
            width: 10,
            height: 10,
            shape: "ellipse",
            "overlay-opacity": 0,
            "border-width": 10,
            "border-opacity": 0
        }
    },
    {
        selector: ".eh-hover",
        style: {
            "background-color": "#ff6347"
        }
    },
    {
        selector: ".eh-source",
        style: {
            "border-width": 2,
            "border-color": "#ff6347"
        }
    },
    {
        selector: ".eh-target",
        style: {
            "border-width": 2,
            "border-color": "#ff6347",
            "background-color": "#ff6347"
        }
    },
    {
        selector: ".eh-preview, .eh-ghost-edge",
        style: {
          "background-color": "#ff6347",
          "line-color": "#ff6347",
          "target-arrow-color": "#ff6347",
          "source-arrow-color": "#ff6347"
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

function render(elements) {
    cy = cytoscape({
        container: document.getElementById('whiteboard'),
        layout: {
            name: "grid",
            rows: 2,
            cols: 2
        },
        elements: elements,
        style: cyStyle
    });
    cy.layout(options);
    
    // add node using left mouse click
    cy.on('click', function(cyEvent){
        if (isEditMode) {
            var target = cyEvent.target;
            
            // empty area click
            if(target === cy){
                cy.add([
                    { group:'nodes', data: { id: nodeId }, renderedPosition: cyEvent.renderedPosition }
                ]);
                // add node to graph
                graph[nodeId++] = [];
            }
        }
    });

    // remove node or edge using right mouse click
    cy.on('cxttap', function(cyEvent) {
        if (isEditMode) {
            var target = cyEvent.target;            
            // check that target is a cy element
            if(target != cy) {
                cy.remove(cy.$('#' + target.id()));
            }
        }
    });

    cy.on('mouseout', 'node', function(event) {
        setTimeout(function(){ eh.hide(); }, 1500);
    });

    // add edge using node handle
    eh = cy.edgehandles({
        preview: false,
        toggleOffOnLeave: false,
        handleNodes: "node",
        snap: true,
        snapThreshold: 20,
        snapFrequency: 15,
        edgeType: function() {
            return 'flat';
        },
        handlePosition: function( node ){
            return 'middle bottom';
        },
        loopAllowed: function( node ){
            return true;
        },
        edgeParams: function( sourceNode, targetNode, i ){
            return { group:'edges', data: { source: sourceNode.id(), target: targetNode.id(), cost: 1 } };
        },
        complete: function( sourceNode, targetNode, addedEles ){
            graph[sourceNode.id()].push([targetNode.id(), 1]);
        },
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

function center() {
    cy.center();
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
    if (isEditMode) {
        eh.enable();
    }
    else {
        eh.disable();
    }
}

var graph = {};
var cy, eh;
var isEditMode = false;
var nodeId = 0;
var selectedNodeCounter = 0;
var selectedTailNode;
var selectedHeadNode;
var table = document.getElementById("graph_table");

render([]);