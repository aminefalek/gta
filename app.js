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
});


function loadGraphs() {
    var graphs = {};
    
    var path = 'graphs/';
    var files  = fs.readdirSync(path);
    
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
                var cost = features[1];
                
                neighbours.push([head, cost]);                
            });
            
            graph[tail++] = neighbours;
        });
        
        graphs[file.split('.')[0]] = graph;

        rl.on('close', function() {
            console.log("Graphs ready..");
        });
    });
    
    return graphs;
}

var graphs = loadGraphs();
