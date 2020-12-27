if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

var fs = require('fs')
const users = []

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const app = express()

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

app.use(express.static('public'))
app.use(express.json({ limit: '1mb' }));
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now.toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (error) {
        res.redirect('/login')
    }
})

app.listen(3000, () => console.log("listening at 3000"));

app.post('/api', (request, response) => {

    var type = request.body['type'];
    
    if (type == 'graph') {
        var name  = request.body['name'];
        response.json(graphs[name]);
    } else if (type == 'graph_names') {
        response.json(Object.keys(graphs));
    } else if (type == 'save') {
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