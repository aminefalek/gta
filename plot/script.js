var width  = 1500;
var height = 1000;

var fill = d3.scale.category20();

var force = d3.layout.force()
    .size([width, height])
    .nodes([{}]) // initialize with a single node
    .linkDistance(100)
    .charge(-50)
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", addNode);;

svg.append("rect")
    .attr("width", width)
    .attr("height", height);

var nodes = force.nodes();
var links = force.links();

var node = svg.selectAll(".node");
var link = svg.selectAll(".link");

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

function addNode() {
    var point = d3.mouse(this);
    nodes.push({x: point[0], y: point[1]});
    
    node = node.data(nodes);
    node.enter().insert("circle", ".cursor")
        .attr("class", "node")
        .attr("r", 5);
    
    addLink(0, 1, 5);
    
    force.start();
}

function addLink(tail, head, cost) {
    links.push({source: nodes[tail], target: nodes[head]});
    
    link = link.data(links);

    link.enter().insert("line", ".node")
        .attr("class", "link");
}

function loadGraph(filename) {
    
}
