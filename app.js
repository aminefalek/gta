if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const User = require('./models/User')
const Graph = require('./models/Graph')
const Script = require('./models/Script')
const app = express()

const dbURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@gta.eldo9.mongodb.net/gta?retryWrites=true&w=majority`
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
        .then((result) => app.listen(3000, () => console.log("listening at 3000")))
        .catch((error) => console.log(error))

const initializePassport = require('./passport-config')
initializePassport(passport)

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
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    user.save()
        .then((result) => {
            return res.redirect('/login')
        })
        .catch((error) => {
            console.log(error)
            return res.redirect('/login')
        })
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.post('/save-graph', (req, res) => {    
    Graph.findOne({ name: req.body.name }, (err, graph) => {
        if (graph) {
            graph.name = req.body.name
            graph.graph = req.body.graph
            graph.layout = req.body.layout
            graph.save()
                .then((result) => {
                    res.json({status: 'graph added to database'})
                })
                .catch((error) => {
                    console.log(error)
                })
        } else {
            const graph = new Graph({
                userId: req.user.id,
                name: req.body.name,
                graph: req.body.graph,
                layout: req.body.layout
            })
            graph.save()
                .then((result) => {
                    res.json({status: 'graph added to database'})
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    })
})

app.post('/load-graph', (req, res) => {
    Graph.findOne({ name: req.body.name }, (err, graph) => {
        res.json(graph);
    });
})

app.post('/load-graph-names', (req, res) => {
    Graph.find({ userId: req.user.id }, (err, graphs) => {
        let graphNames = []
        graphs.forEach(graph => {
            graphNames.push(graph['name'])
        });
        res.json(graphNames);
    });
})

app.post('/save-script', (req, res) => {
    Script.findOne({ name: req.body.name }, (err, script) => {
        if (script) {
            script.name = req.body.name
            script.code = req.body.code
            script.save()
                .then((result) => {
                    res.json({status: 'script added to database'})
                })
                .catch((error) => {
                    console.log(error)
                })
        } else {
            const script = new Script({
                userId: req.user.id,
                name: req.body.name,
                code: req.body.code,
            })
            script.save()
                .then((result) => {
                    res.json({status: 'script added to database'})
                })
                .catch((error) => {
                    console.log(error)
                })
        }
    })
})