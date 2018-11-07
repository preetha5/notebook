const express = require('express');
const app = express();
const morgan = require('morgan');
const {Notes} = require('./models/notes');
const bodyParser = require('body-parser');
const jsonParser =  bodyParser.json();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

//Middleware, Logging
app.use(morgan('common'));
app.use(express.static('public'));
app.use(jsonParser);

const adapter = new FileSync('db/db.json');
const db = low(adapter);

    //Routes

    app.get('/', (req,res) =>{
        res.send('index.html');
    })

    function mySearch(query){
        return function(element) {
                console.log('message is ' , element.message);
              if(element.message.includes(query)) {
                  console.log("elem being returned ", element)
                return true;
              }
            return false;
          }
    }

    //GET /notes/:id
    app.get('/notes', (req,res) => {

        if(req.query['search']){
           console.log("query is ", req.query['search']);
           const filtered = db.get('notes').filter(mySearch(req.query['search']));
           res.send({notes: filtered});
        } else {
        const notes = db.get('notes').value();
        console.log("notes ", notes);
        res.send(notes);
        }
    })

    app.get('/notes/:id', (req,res) => {
        const noteId = parseInt(req.params.id);
        console.log("id is:", noteId);
        const note = db.get('notes')
            .find({id:noteId})
            .value()
        console.log("found note with id ", note);
            res.send(note);
    })

    app.post('/notes', jsonParser, (req, res) => {
        console.log("request ", req.body.message);
        db.get('notes')
        .push({ id: Date.now(), message: req.body.message})
        .write()

        res.status(201).send('note added')
    })

    app.delete('/notes/:id', (req,res) =>{
        //TBD: check if the ID exists


        const noteId = parseInt(req.params.id);
        console.log("id to remove:", noteId);
        db.get('notes')
        .remove({id:noteId})
        .write();
        res.status(204).end();
    })

    app.put('/notes/:id', jsonParser, (req, res) => {
        const noteId = parseInt(req.params.id);
        console.log("updated message ", req.body.message);
        db.get('notes')
            .find({id:noteId})
            .assign({message: req.body.message})
            .write();
        res.send('updated');
    });

    //UNDOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO LATER
  // db.defaults({notes:[]}).write()

//Routes
app.get('*', (req, res) => res.send('ok'));
app.listen(process.env.PORT || 8000, ()=>{
    console.log("App is listening on 8000");
});