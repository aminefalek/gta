var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

const express = require('express');
const app = express();
app.listen(3000, () => console.log("listening at 3000"));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.post('/api', (request, response) => {
    console.log(request.body);
    
    var type = request.body['type'];
    
    if (type == 'graph') {
        var name  = request.body['name'];    
        response.json(graphs[name]);
    }
    
    else if (type == 'graph_names') {
        response.json(Object.keys(graphs));
    }
    
    else if (type == 'save') {
        var name  = request.body['name'];
        var graph = request.body['data'];
        
        graphs[name] = graph;
        saveGraph(name, graph);
    }
});

function saveGraph(name, graph) {
    var path = 'graphs/';
    var fs = require('fs')
    var file = fs.createWriteStream(path + name + '.txt', {flags: 'w'});

    for (var i=0; i<Object.keys(graph).length; i++) {
        graph[i].forEach(edge => {
            file.write(edge.join() + '\r\n');
        });
    }
}

function loadGraphs() {
    var graphs = {};
    
    var path = 'graphs/';
    var files  = fs.readdirSync(path);
    var name;
    
    files.forEach(file => {
        var instream = fs.createReadStream(path + file);
        
        var outstream = new stream;
        var rl = readline.createInterface(instream, outstream);
        
        var graph = {};
        var tail = 0;

        rl.on('line', function(line) {
            var edges = line.split('\t');            
            var neighbours = [];
            
            edges.forEach(edge => {
                var features  = edge.split(',');                
                
                var head = features[0];
                var cost = parseInt(features[1]);
                
                neighbours.push([head, cost]);                
            });
            
            graph[tail++] = neighbours;
        });
        
        name = file.split('.')[0];
        graphs[name] = graph;

        rl.on('close', function() {
            console.log("Graph " + name + " ready..");
        });
    });
    
    return graphs;
}

var graphs = loadGraphs();
