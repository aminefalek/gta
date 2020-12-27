var fs = require('fs');

const express = require('express');
const app = express();
app.listen(3000, () => console.log("listening at 3000"));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.post('/api', (request, response) => {    
    var type = request.body['type'];
    
    if (type == 'graph') {
        var name  = request.body['name'];
        response.json(graphs[name]);
    } else if (type == 'graph_names') {
        response.json(Object.keys(graphs));
    } else if (type == 'save') {
        var fs = require('fs');
        var name  = request.body['name'];
        graph = {'graph': request.body['graph'],
                 'layout': request.body['layout']};
        fs.writeFile('graphs/' + name + '.json', JSON.stringify(graph, null, 2), function(err) {
            if (err) {
                console.log('Error: ' + err);
            }
        });        
        graphs[name] = graph;
    }
});

function loadGraphs() {
    var graphs = {};
    
    var path = 'graphs/';
    var files  = fs.readdirSync(path);
    var name;
    
    files.forEach(file => {
        const fs = require('fs');
        let data = fs.readFileSync(path + file);
        let graph = JSON.parse(data);
        name = file.split('.')[0];
        graphs[name] = graph;
    });
    console.log('All graphs loaded.');
    return graphs;
}

var graphs = loadGraphs();
