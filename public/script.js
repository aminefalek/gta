const STYLE = [
    {
        selector: "node",
        style: {
            width: "1.5em",
            height: "1.5em",
            "border-width": 3,
            "border-color": "black",
            "background-color": "black",
            label: "data(id)",
            "text-wrap": "wrap",
        },
    },
    {
        selector: "edge",
        style: {
            width: 3,
            color: "#666666",
            "line-color": "#666666",
            "target-arrow-color": "#666666",
            "target-arrow-shape": "triangle",
            label: "data(cost)",
            "curve-style": "bezier",
            "text-margin-y": -10,
        },
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
            "border-opacity": 0,
        },
    },
    {
        selector: ".eh-hover",
        style: {
            "background-color": "#ff6347",
        },
    },
    {
        selector: ".eh-source",
        style: {
            "border-width": 2,
            "border-color": "#ff6347",
        },
    },
    {
        selector: ".eh-target",
        style: {
            "border-width": 2,
            "border-color": "#ff6347",
            "background-color": "#ff6347",
        },
    },
    {
        selector: ".eh-preview, .eh-ghost-edge",
        style: {
            "background-color": "#ff6347",
            "line-color": "#ff6347",
            "target-arrow-color": "#ff6347",
            "source-arrow-color": "#ff6347",
        },
    },
];

const LAYOUT = {
    name: "preset",
};

const LAYOUT_GRID = {
    name: "grid",
};

function initialize() {
    cy = cytoscape({
        container: document.getElementById("whiteboard"),
        elements: [],
        boxSelectionEnabled: true,
        selectionType: "single",
        zoomingEnabled: false,
        style: STYLE,
    });
    cy.layout(LAYOUT);

    // add node using left mouse click
    cy.on("click", function (cyEvent) {
        var target = cyEvent.target;

        resetSelection();

        if (isEditMode) {
            if (target === cy) {
                if (selectedEdge) {
                    selectedEdge.data(
                        "cost",
                        numberInput.value == "" ? 1 : numberInput.value
                    );
                    updateEdgeCost(selectedEdge);
                    resetEdgeStyle(selectedEdge);
                    selectedEdge.tippy.destroy();
                    selectedEdge = null;
                } else {
                    cy.add([
                        {
                            group: "nodes",
                            data: { id: nodeId },
                            renderedPosition: cyEvent.renderedPosition,
                        },
                    ]);
                    graph[nodeId++] = [];
                    updateVerticesList();
                }
            } else if (target.isEdge() && !selectedEdge) {
                selectedEdge = target;
                selectedEdge.style({
                    "line-color": "tomato",
                    "target-arrow-color": "tomato",
                });
                numberInput.value = selectedEdge.data("cost");
                enableEdgeControl(selectedEdge);
            }
        }
    });

    // remove node or edge using right mouse click
    cy.on("cxttap", function (cyEvent) {
        if (isEditMode) {
            if (selectedEdge) {
                selectedEdge.data("cost", numberInput.value);
                resetEdgeStyle(selectedEdge);
                selectedEdge.tippy.destroy();
                selectedEdge = null;
            } else {
                var target = cyEvent.target;
                if (target != cy) {
                    if (
                        cy.$(":selected").length > 0 &&
                        cy.$(":selected").contains(target)
                    ) {
                        cy.$(":selected").forEach((element) => {
                            delete graph[element.id()];
                        });
                        cy.remove(cy.$(":selected"));
                    } else {
                        cy.remove(cy.$("#" + target.id()));
                        delete graph[target.id()];
                    }
                    updateVerticesList();
                }
            }
        }
    });

    cy.on("mouseover", "node", function (event) {
        clearTimeout(timer);
    });

    cy.on("mouseout", "node", function (event) {
        if (event.target.tippy) {
            event.target.tippy.destroy();
        }
        timer = setTimeout(function () {
            eh.hide();
        }, 1500);
    });

    cy.on("boxselect", "node", function (event) {
        var target = event.target;
        target.style({ "background-color": "tomato" });
        target.select();
    });

    // add edge using node handle
    eh = cy.edgehandles({
        preview: false,
        toggleOffOnLeave: false,
        handleNodes: "node",
        hoverDelay: 100,
        snap: true,
        snapThreshold: 20,
        snapFrequency: 15,
        edgeType: function () {
            return "flat";
        },
        handlePosition: function (node) {
            return "middle bottom";
        },
        loopAllowed: function (node) {
            return true;
        },
        edgeParams: function (sourceNode, targetNode, i) {
            return {
                group: "edges",
                data: {
                    source: sourceNode.id(),
                    target: targetNode.id(),
                    cost: 1,
                },
            };
        },
        complete: function (sourceNode, targetNode, addedEles) {
            graph[sourceNode.id()].push({ head: targetNode.id(), cost: 1 });
        },
    });
    eh.disable();
}

function drawRandomGraph() {
    generateRandomGraph(
        GRAPH_SIZE_UI.value,
        GRAPH_DENSITY_UI.value,
        GRAPH_MIN_WEIGHT_UI.value,
        GRAPH_MAX_WEIGHT_UI.value
    );
    drawGraph(null);
}

function generateRandomGraph(size, density, edgeCostMin, edgeCostMax) {
    graph = {};
    for (var i = 0; i < size; i++) {
        addNode(i);
    }
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (i != j && Math.random() < density) {
                addEdge(i, j, getRandomInt(edgeCostMin, edgeCostMax));
            }
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addNode(node) {
    graph[node] = [];
    nodeId++;
}

function addEdge(tail, head, cost) {
    if (tail in graph && head in graph && !edgeExists(tail, head)) {
        graph[tail].push({ head: head, cost: cost });
    }
}

function edgeExists(tail, head) {
    for (var i = 0; i < graph[tail].length; i++) {
        if (graph[tail][i]["head"] == head) {
            return true;
        }
    }
    return false;
}

function resetSelection() {
    cy.$(":selected").style({ "background-color": "black" });
    cy.$(":selected").unselect();
}

function resetNodeStyle(node) {
    if (node) {
        node.style({ "background-color": "black" });
    }
}

function resetEdgeStyle(edge) {
    if (edge) {
        edge.style({
            "line-color": "#666666",
            "target-arrow-color": "#666666",
        });
    }
}

function resetGraphStyle() {
    cy.nodes().style({ "background-color": "black" });
    cy.edges().style({
        "line-color": "#666666",
        "target-arrow-color": "#666666",
    });
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
        theme: "tomato",
        distance: "-25",
        hideOnClick: false,
        multiple: true,
        sticky: true,
        interactive: true,
    });
    ele.tippy.show();
}

function initializeWeightInputUI() {
    weightInput = document.createElement("div");
    buttonMinus = document.createElement("button");
    buttonPlus = document.createElement("button");
    numberInput = document.createElement("input");

    weightInput.className = "number-input";
    buttonPlus.className = "plus";
    buttonMinus.onclick = stepDown;
    buttonPlus.onclick = stepUp;
    numberInput.className = "quantity";
    numberInput.id = "weight";
    numberInput.type = "number";
    numberInput.value = "1";

    weightInput.appendChild(buttonMinus);
    weightInput.appendChild(numberInput);
    weightInput.appendChild(buttonPlus);
}

function stepDown() {
    var value = parseInt(numberInput.value);
    numberInput.value = --value;
}

function stepUp() {
    var value = parseInt(numberInput.value);
    numberInput.value = ++value;
}

function updateEdgeCost(updatedEdge) {
    graph[updatedEdge.source().id()].forEach((edge) => {
        if (edge["head"] == updatedEdge.target().id()) {
            edge["cost"] = parseInt(updatedEdge.data("cost"));
            return;
        }
    });
}

function updateVerticesList() {
    for (i = VERTEX_SELECTION_UI.options.length - 1; i >= 0; i--) {
        VERTEX_SELECTION_UI.options[i] = null;
    }
    var option = document.createElement("option");
    option.text = "graph";
    VERTEX_SELECTION_UI.add(option);
    cy.nodes().forEach((node) => {
        if (isFinite(node.id())) {
            var option = document.createElement("option");
            option.text = node.id();
            VERTEX_SELECTION_UI.add(option);
        }
    });
}

function getColor(color) {
    if (color == "color1") {
        return COLOR_PICKER_1_UI.value;
    } else if (color == "color2") {
        return COLOR_PICKER_2_UI.value;
    } else if (color == "color3") {
        return COLOR_PICKER_3_UI.value;
    }
    return color;
}

//? Accessible to python coding interface
function paint_vertex(id, color, timeout = null) {
    cy.$(`#${id}`)
        .animation({
            style: {
                "background-color": getColor(color),
            },
            duration: 100,
        })
        .play();

    if (timeout) {
        setTimeout(function () {
            cy.nodes(`[id = "${id}"]`).style("background-color", "black");
        }, timeout);
    }
}

//? Accessible to python coding interface
function paint_edge(source, target, color, timeout = null) {
    var edge = cy.elements(`edge[source = "${source}"][target = "${target}"]`);
    edge.animation({
        style: {
            "line-color": getColor(color),
            "target-arrow-color": getColor(color),
        },
    }).play();

    if (timeout) {
        setTimeout(function () {
            resetEdgeStyle(edge);
        }, timeout);
    }
}

function clearGraph() {
    cy.elements().remove();
    graph = {};
    nodeId = 0;
}

function drawGraph(layout) {
    var elements = [];

    if (layout) {
        var coordinates = getNodeCoordinates(layout);
        Object.keys(graph).forEach(function (tail) {
            elements.push({
                group: "nodes",
                data: { id: tail },
                position: {
                    x: coordinates[tail]["x"],
                    y: coordinates[tail]["y"],
                },
            });
            graph[tail].forEach(function (edge) {
                elements.push({
                    group: "edges",
                    data: {
                        source: tail,
                        target: edge["head"],
                        cost: edge["cost"],
                    },
                });
            });
        });
        nodeId = Object.keys(graph).length;

        cy.elements().remove();
        cy.add(elements);
        var layout = cy.elements().makeLayout(LAYOUT);
        layout.run();
        cy.center();
    } else {
        Object.keys(graph).forEach(function (tail) {
            elements.push({
                group: "nodes",
                data: { id: tail },
            });
            graph[tail].forEach(function (edge) {
                elements.push({
                    group: "edges",
                    data: {
                        source: tail,
                        target: edge["head"],
                        cost: edge["cost"],
                    },
                });
            });
        });
        nodeId = Object.keys(graph).length;

        cy.elements().remove();
        cy.add(elements);
        var layout = cy.elements().makeLayout(LAYOUT_GRID);
        layout.run();
        cy.center();
    }
}

function highlightLine(line) {
    CODE_MIRROR.addLineClass(line, "background", "highlighted-line");
    highlightedLine = line;
}

function resetLine(line) {
    CODE_MIRROR.removeLineClass(line, "background", "highlighted-line");
}

function editMode() {
    isEditMode = !isEditMode;

    if (isEditMode) {
        COLLAPSE_LEFT_UI.disabled = true;
        eh.enable();
        for (i = 0; i < RADIO_BUTTONS_UI.length; i++) {
            RADIO_BUTTONS_UI[i].disabled = true;
            RADIO_BUTTONS_UI[i].checked = false;
        }
    } else {
        COLLAPSE_LEFT_UI.disabled = false;
        eh.disable();
        for (i = 0; i < RADIO_BUTTONS_UI.length; i++) {
            RADIO_BUTTONS_UI[i].disabled = false;
        }
        resetEdgeStyle(selectedEdge);
        if (selectedEdge) {
            selectedEdge.tippy.destroy();
        }
        selectedEdge = null;
    }
}

function getNodePositions() {
    var coordinates = cy.nodes().map((n) => n.position());
    var positions = [];
    var width = window.screen.width;
    var height = window.screen.height;
    coordinates.forEach((node) => {
        positions.push({
            x: Math.round((100 * (width - node["x"])) / width),
            y: Math.round((100 * (height - node["y"])) / height),
        });
    });
    return positions;
}

function getNodeCoordinates(positions) {
    var coordinates = [];
    var width = window.screen.width;
    var height = window.screen.height;
    positions.forEach((node) => {
        coordinates.push({
            x: width * (1 - node["x"] / 100),
            y: height * (1 - node["y"] / 100),
        });
    });
    return coordinates;
}

async function saveGraph() {
    var name = GRAPH_SAVE_UI.value.trim();
    var error = false;

    if (Object.keys(graph).length === 0) {
        error = true;
        GRAPH_INPUT_FEEDBACK.innerHTML = EMPTY_GRAPH_ERROR;
    } else if (name.length == 0) {
        error = true;
        GRAPH_INPUT_FEEDBACK.innerHTML = EMPTY_GRAPH_NAME_ERROR;
    }

    if (error) {
        GRAPH_SAVE_UI.classList.add("is-invalid");
        setTimeout(() => {
            GRAPH_SAVE_UI.classList.remove("is-invalid");
        }, 5000);
    } else {
        GRAPH_SAVE_UI.classList.remove("is-invalid");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: GRAPH_SAVE_UI.value,
                graph: graph,
                layout: getNodePositions(),
            }),
        };
        GRAPH_SAVE_UI.value = "";

        await fetch("/save-graph", options).then((response) => {
            loadGraphNames();
        });
    }
}

async function loadGraph() {
    var error = false;
    if (
        GRAPH_DROPDOWN_UI.length === 0 ||
        !GRAPH_DROPDOWN_UI.options[GRAPH_DROPDOWN_UI.selectedIndex]
    ) {
        error = true;
        GRAPH_LOAD_FEEDBACK.innerHTML = INVALID_GRAPH_SELECT_ERROR;
    }

    if (error) {
        GRAPH_DROPDOWN_UI.classList.add("is-invalid");
        setTimeout(() => {
            GRAPH_DROPDOWN_UI.classList.remove("is-invalid");
        }, 5000);
    } else {
        GRAPH_DROPDOWN_UI.classList.remove("is-invalid");
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name:
                    GRAPH_DROPDOWN_UI.options[GRAPH_DROPDOWN_UI.selectedIndex]
                        .text,
            }),
        };
        const response = await fetch("/load-graph", options);
        data = await response.json();
        graph = data["graph"];
        drawGraph(data["layout"]);
    }
}

async function deleteGraph() {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name:
                GRAPH_DROPDOWN_UI.options[GRAPH_DROPDOWN_UI.selectedIndex].text,
        }),
    };
    const response = await fetch("/delete-graph", options);
    data = await response.json();
    loadGraphNames();
}

async function loadGraphNames() {
    for (i = GRAPH_DROPDOWN_UI.options.length - 1; i >= 0; i--) {
        GRAPH_DROPDOWN_UI.options[i] = null;
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await fetch("/load-graph-names", options);
    var graphNames = await response.json();

    graphNames.forEach((name) => {
        var option = document.createElement("option");
        option.text = name;
        GRAPH_DROPDOWN_UI.add(option);
    });

    GRAPH_DROPDOWN_UI.value = graphNames[0];
}

async function saveScript() {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: SCRIPT_SAVE_UI.value,
            code: CODE_MIRROR.getValue(),
        }),
    };

    await fetch("/save-script", options).then((response) => {
        setTimeout(saveScript, 15000);
    });
}

async function loadScript() {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name:
                SCRIPT_DROPDOWN_UI.options[SCRIPT_DROPDOWN_UI.selectedIndex]
                    .text,
        }),
    };

    const response = await fetch("/load-script", options);
    data = await response.json();
    script = data["code"];
    CODE_MIRROR.setValue(script);
}

async function loadScriptNames() {
    for (i = SCRIPT_DROPDOWN_UI.options.length - 1; i >= 0; i--) {
        SCRIPT_DROPDOWN_UI.options[i] = null;
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = await fetch("/load-script-names", options);
    var scriptNames = await response.json();

    scriptNames.forEach((name) => {
        var option = document.createElement("option");
        option.text = name;
        SCRIPT_DROPDOWN_UI.add(option);
    });

    GRAPH_DROPDOWN_UI.value = scriptNames[0];
}

window.clearGraph = function clearGraph() {
    cy.elements().remove();
    graph = {};
    nodeId = 0;
};

window.center = function center() {
    var id = VERTEX_SELECTION_UI.value;
    if (id === "graph") {
        cy.center();
    } else {
        cy.center(cy.$("#" + id));
    }
};

function checkbox(id) {
    for (var i = 0; i < RADIO_BUTTONS_UI.length; i++) {
        if (i == id && RADIO_BUTTONS_UI[i].checked) {
            RADIO_BUTTONS_UI[i].checked = true;
        } else {
            RADIO_BUTTONS_UI[i].checked = false;
        }
    }
}

var graph = {};
var cy, eh;
var timer;
var isEditMode = false;
var nodeId = 0;
var selectedEdge;
var weightInput, buttonMinus, buttonPlus, numberInput;
var executing = false;
var paused = true;
var highlightedLine = 0;
var step = null;

const GRAPH_DROPDOWN_UI = document.getElementById("graphs-select");
const GRAPH_SAVE_UI = document.getElementById("save-graph-input");
const SCRIPT_DROPDOWN_UI = document.getElementById("scripts-select");
const SCRIPT_SAVE_UI = document.getElementById("save-script-input");
const VERTEX_SELECTION_UI = document.getElementById("vertex-select");
const RADIO_BUTTONS_UI = document.getElementsByName("algorithms");
const NAVBAR_UI = document.getElementById("navbar");
const CONTROL_UI = document.getElementById("control");
const PLAYER_UI = document.getElementById("player");
const SIDEBAR_LEFT_UI = document.getElementById("sidebar-left");
const SIDEBAR_RIGHT_UI = document.getElementById("sidebar-right");
const COLLAPSE_LEFT_UI = document.getElementById("collapse-left");
const COLLAPSE_RIGHT_UI = document.getElementById("collapse-right");
const RUN_BUTTON_UI = document.getElementById("run-button");
const STEP_BUTTON_UI = document.getElementById("step-button");
const STOP_BUTTON_UI = document.getElementById("stop-button");
const SLIDER_UI = document.getElementById("slider");
const COLOR_PICKER_1_UI = document.getElementById("color1");
const COLOR_PICKER_2_UI = document.getElementById("color2");
const COLOR_PICKER_3_UI = document.getElementById("color3");
const CONSOLE_UI = document.getElementById("console");
const SWITCH_UI = document.getElementById("switch");
const GRAPH_SIZE_UI = document.getElementById("graph-size-input");
const GRAPH_DENSITY_UI = document.getElementById("graph-density-input");
const GRAPH_MIN_WEIGHT_UI = document.getElementById("graph-min-weight-input");
const GRAPH_MAX_WEIGHT_UI = document.getElementById("graph-max-weight-input");
const CODE_MIRROR = CodeMirror(NAVBAR_UI, {
    value: `for v in GRAPH:
    print('vertex: ' + v)
    paint_vertex(v, 'color1')
    for edge in GRAPH[v]:
        w = edge['head']
        print('edge: ({}, {})'.format(v, w))
        paint_edge(v, w, 'color2')`,

    mode: "python",
    theme: "monokai",
    indentUnit: 4,
    lineNumbers: true,
});
CODE_MIRROR.setSize("100%", "100%");

SLIDER_UI.addEventListener("change", function () {
    this.setAttribute("value", this.value);
});

// Toggle run/pause button icon in control panel
RUN_BUTTON_UI.onclick = function () {
    step = null;
    paused = !paused;
    RUN_BUTTON_UI.firstChild.classList.toggle("fa-pause");
    STEP_BUTTON_UI.disabled = !STEP_BUTTON_UI.disabled;
};

STEP_BUTTON_UI.onclick = function () {
    step = highlightedLine;
    RUN_BUTTON_UI.firstChild.classList.remove("fa-pause");
};

STOP_BUTTON_UI.onclick = function () {
    resetLine(highlightedLine);
    highlightedLine = 0;
    RUN_BUTTON_UI.firstChild.classList.remove("fa-pause");
    clearConsole();
    resetGraphStyle();
    executing = false;
    paused = true;
    step = null;
};

async function clearConsole() {
    CONSOLE_UI.value = "";
}

function collapseRightSidebar() {
    SIDEBAR_RIGHT_UI.style.marginRight = -SIDEBAR_RIGHT_UI.clientWidth + "px";
}

function openRightSidebar() {
    SIDEBAR_RIGHT_UI.style.marginRight = "0px";
}

function toggleRightSidebar() {
    var offset =
        window.innerWidth -
        (SIDEBAR_RIGHT_UI.offsetLeft + SIDEBAR_RIGHT_UI.clientWidth);
    if (offset < 0) {
        openRightSidebar();
    } else {
        collapseRightSidebar();
    }
}

function collapseLeftSidebar() {
    SIDEBAR_LEFT_UI.classList.add("transition");
    SIDEBAR_LEFT_UI.style.marginLeft = -SIDEBAR_LEFT_UI.clientWidth + "px";
}

function openLeftSidebar() {
    SIDEBAR_LEFT_UI.classList.add("transition");
    SIDEBAR_LEFT_UI.style.marginLeft = "0px";
}

function toggleLeftSidebar() {
    if (SIDEBAR_LEFT_UI.offsetLeft < 0) {
        openLeftSidebar();
    } else {
        collapseLeftSidebar();
    }
}

// Toggle right sidebar with transition animation
COLLAPSE_RIGHT_UI.onclick = function () {
    toggleRightSidebar();
};

// Toggle left sidebar with transition animation
COLLAPSE_LEFT_UI.onclick = function () {
    toggleLeftSidebar();
};

// Control vertical and horizontal resizers
document.addEventListener("DOMContentLoaded", function () {
    const resizable = function (resizer) {
        const direction =
            resizer.getAttribute("data-direction") || "horizontal";
        var side1, side2;

        if (direction === "vertical") {
            side1 = NAVBAR_UI;
            side2 = CONTROL_UI;
        } else {
            side1 = SIDEBAR_LEFT_UI;
            side2 = SIDEBAR_LEFT_UI;
        }

        // The current position of mouse
        let x = 0;
        let y = 0;
        let side1Height = 0;
        let side1Width = 0;

        // Handle the mousedown event
        const mouseDownHandler = function (e) {
            // Disable transition animation when manually resizing sidebar
            SIDEBAR_LEFT_UI.classList.remove("transition");

            // Get the current mouse position
            x = e.clientX;
            y = e.clientY;
            const rect = side1.getBoundingClientRect();
            side1Height = rect.height;
            side1Width = rect.width;

            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", mouseUpHandler);
        };

        const mouseMoveHandler = function (e) {
            const dx = e.clientX - x;
            const dy = e.clientY - y;

            switch (direction) {
                case "vertical":
                    const h =
                        ((side1Height + dy) * 100) /
                        resizer.parentNode.getBoundingClientRect().height;
                    side1.style.height = `${h}%`;
                    break;
                case "horizontal":
                default:
                    const w =
                        ((side1Width + dx) * 100) /
                        resizer.parentNode.getBoundingClientRect().width;
                    side1.style.width = `${w}%`;
                    break;
            }

            const cursor =
                direction === "horizontal" ? "col-resize" : "row-resize";
            resizer.style.cursor = cursor;
            document.body.style.cursor = cursor;

            side1.style.userSelect = "none";
            side1.style.pointerEvents = "none";

            side2.style.userSelect = "none";
            side2.style.pointerEvents = "none";
        };

        const mouseUpHandler = function () {
            resizer.style.removeProperty("cursor");
            document.body.style.removeProperty("cursor");

            side1.style.removeProperty("user-select");
            side1.style.removeProperty("pointer-events");

            side2.style.removeProperty("user-select");
            side2.style.removeProperty("pointer-events");

            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
        };

        // Attach the handler
        resizer.addEventListener("mousedown", mouseDownHandler);
    };

    // Query all resizers
    document.querySelectorAll(".resizer").forEach(function (ele) {
        resizable(ele);
    });
});

const GRAPH_INPUT_FEEDBACK = document.getElementById("graph-name-feedback");
const GRAPH_LOAD_FEEDBACK = document.getElementById("graph-load-feedback");
const EMPTY_GRAPH_ERROR = "draw a graph.";
const EMPTY_GRAPH_NAME_ERROR = "write a valid graph name.";
const INVALID_GRAPH_SELECT_ERROR = "invalid graph selection.";

initializeWeightInputUI();
loadGraphNames();
loadScriptNames();
collapseLeftSidebar();
initialize();
