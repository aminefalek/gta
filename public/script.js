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
        boxSelectionEnabled: true,
        selectionType : 'single',
        style: cyStyle
    });
    cy.layout(options);
    cy.userZoomingEnabled(false);
    
    // add node using left mouse click
    cy.on('click', function(cyEvent){
        var target = cyEvent.target;

        resetSelection();
        
        if (isEditMode) {
            if (target === cy) {
                if (selectedEdge) {
                    selectedEdge.data('cost', numberInput.value == '' ? 1: numberInput.value);
                    resetEdgeStyle(selectedEdge);
                    selectedEdge.tippy.destroy();
                    selectedEdge = null;
                } else {
                    cy.add([
                        { group:'nodes', data: { id: nodeId }, renderedPosition: cyEvent.renderedPosition }
                    ]);
                    graph[nodeId++] = [];
                    updateVerticesList();                    
                }                
            } else if (target.isEdge() && !selectedEdge) {
                selectedEdge = target;
                selectedEdge.style( { 'line-color' : 'tomato', 'target-arrow-color': 'tomato' });
                numberInput.value = selectedEdge.data('cost');
                enableEdgeControl(selectedEdge);
            }
        }
    });

    // remove node or edge using right mouse click
    cy.on('cxttap', function(cyEvent) {
        if (isEditMode) {
            if (selectedEdge) {
                selectedEdge.data('cost', numberInput.value);
                resetEdgeStyle(selectedEdge);
                selectedEdge.tippy.destroy();
                selectedEdge = null;
            } else {
                var target = cyEvent.target;
                if(target != cy) {
                    if (cy.$(':selected').length > 0 && cy.$(':selected').contains(target)) {
                        cy.$(':selected').forEach(element => {
                            delete graph[element.id()];
                        });
                        cy.remove(cy.$(':selected'));
                    }
                    else {
                        cy.remove(cy.$('#' + target.id()));
                        delete graph[target.id()];
                    }
                    updateVerticesList();
                }
            }
            
        }
    });

    cy.on('mouseout', 'node', function(event) {
        if (event.target.tippy) {
            event.target.tippy.destroy();
        }        
        setTimeout(function(){ eh.hide(); }, 1500);
    });

    cy.on('boxselect', 'node', function(event) {
        var target = event.target;
        target.style( { 'background-color' : 'tomato' });
        target.select();
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

function resetSelection() {
    cy.$(':selected').style( { 'background-color' : 'black' });
    cy.$(':selected').unselect();
}

function resetEdgeStyle(edge) {
    if (edge) {
        edge.style( { 'line-color' : '#666666', 'target-arrow-color': '#666666' });
    }
}

function enableEdgeControl(ele) {
    let ref = ele.popperRef();
    ele.tippy = tippy(ref, {
        content: () => {
            return weightInput;
        },
        trigger: "manual",
        arrow: false,
        placement: "top",
        theme: 'tomato',
        distance: '-25',
        hideOnClick: false,
        multiple: true,
        sticky: true,
        interactive: true
    });
    ele.tippy.show();
}

function initializeWeightInputUI() {
    weightInput = document.createElement('div');
    buttonMinus = document.createElement('button');
    buttonPlus  = document.createElement('button');
    numberInput = document.createElement('input');
    
    weightInput.className = 'number-input';
    buttonPlus.className  = 'plus';
    buttonMinus.onclick   = stepDown;    
    buttonPlus.onclick    = stepUp;
    numberInput.className = 'quantity';
    numberInput.id        = 'weight';
    numberInput.type      = 'number';
    numberInput.value     = '1';
    
    weightInput.appendChild(buttonMinus);
    weightInput.appendChild(numberInput);
    weightInput.appendChild(buttonPlus);
}

function updateVerticesList() {
    for (i = vertexSelect.options.length-1; i >= 0; i--) {
        vertexSelect.options[i] = null;
    }
    var option = document.createElement("option");
    option.text = '';
    vertexSelect.add(option);
    cy.nodes().forEach(node => {
        if (parseInt(node.id()) >= 0) {
            var option = document.createElement("option");
            option.text = node.id();
            vertexSelect.add(option);
        }
    });
}

function stepDown() {
    var value = parseInt(numberInput.value);
    numberInput.value = --value;
}

function stepUp() {
    var value = parseInt(numberInput.value);
    numberInput.value = ++value;
}

function center() {
    var id = vertexSelect.value;
    if (id === '') {
        cy.center();
    } else {
        cy.center(cy.$('#' + id));
    }    
}

function addNode(id) {
    cy.add([
        { group:'nodes', data: { id: id } }
    ]);
}

function paint_vertex(id, color, timeout=null) {
    console.log('test');
    cy.$(`#${id}`).animation({
        style: {
            'background-color': color
        },
        duration: 100
    }).play();

    if (timeout) {
        setTimeout(function(){ cy.nodes(`[id = "${id}"]`).style('background-color', 'black'); }, timeout);
    }
}

function paint_edge(source, target, color, timeout=null) {
    var edge = cy.elements(`edge[source = "${source}"][target = "${target}"]`);
    edge.animation({
        style: {
            'line-color': color,
            'target-arrow-color': color
        }
    }).play();

    if (timeout) {
        setTimeout(function(){ resetEdgeStyle(edge) }, timeout);
    }
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
var weightControl = false;
var nodeId = 0;
var selectedNodeCounter = 0;
var selectedEdge;
var selectedTailNode;
var selectedHeadNode;
const vertexSelect = document.getElementById("vertex-select");
var weightInput, buttonMinus, buttonPlus, numberInput;

initializeWeightInputUI();
render([]);