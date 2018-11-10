const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const FileAsync = require('lowdb/adapters/FileAsync')
const Notes = require('./model/notes');
const shortId = require('shortid');


const app = express();

//Middleware, Logging
app.use(morgan("common"));
app.use(express.static("public"));
app.use(jsonParser);

//var adapter = new FileSync("db/db.json");
//const adapter = new FileAsync("db/db.json");
var adapter;
var db;

//Routes

app.get("/", (req, res) => {
  res.send("index.html");
});

//Custom Search function for array filter
function mySearch(query) {
  return function(element) {
    if (element.message.includes(query)) {
      console.log("elem being returned ", element);
      return true;
    }
    return false;
  };
}

//GET ALL NOTES 
app.get("/notes", (req, res) => {
  if (req.query["search"]) {
    console.log("query is ", req.query["search"]);
    const filtered = db.get("notes").filter(mySearch(req.query["search"])).value();
    res.send({ notes: filtered });
  } else {
    const notes = db.get("notes").value();
    //console.log("notes ", notes);
    res.send(notes);
  }
});

//GET NOTE WITH ID
app.get("/notes/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  console.log("id is:", noteId);
  const note = db
    .get("notes")
    .find({ id: noteId })
    .value();
  if(note){
    console.log("found note with id ", note);
    res.send(note);
  }else{
    res.status(500).send("Error: Invalid input");
  }
  
});

//ADD ONE OR MORE NOTES
//Request body contains an array of strings to be added
app.post("/notes", jsonParser, (req, res) => {
    const requiredFields = ['notes_array'];
  for(field of requiredFields){
      if(!(field in req.body)){
        const status = `Missing "${field}" in request body`;
        console.error(status);
        return res.status(400).send(status);
      }
  }
    const notes_array = req.body.notes_array;
    const newNotes =[];
    for(let item of notes_array){
        const newNote = {
            id:shortId.generate(),
            message: item
        }
        db.get("notes")
        .push(newNote)
        .write();
        newNotes.push(newNote)
    }
    res.status(201).send(newNotes);
})


//DELETE ONE OR MORE NOTES
//Request contains an array of ID's to be deleted
app.delete('/notes', jsonParser, (req,res)=> {
    const id_arr = req.body.id_array;
    let not_found =[];
    for (noteId of id_arr){
        let item  = db.get('notes').find({id:noteId}).value();
        if(!item){
            console.log("item ", item);
            not_found.push(noteId);
            continue;
        }
        console.log("removing note", noteId);
        db.get('notes')
        .remove({ id: noteId })
        .write()
    }

    if(not_found.length){
        console.log(not_found);
        const message = `Unable to find notes with ID ` + not_found.join(',');
        console.error(message);
       res.status(400).send(message);
    }else{
        res.status(204).end();
    }
});

//UPDATE A NOTE
app.put("/notes/:id", jsonParser, (req, res) => {
  const noteId = req.params.id;
  //Check for required keys from req.body
  console.log("incoming req.body", req.body);
  const requiredFields = ['id','message'];
  for(field of requiredFields){
      if(!(field in req.body)){
        const status = `Missing "${field}" in request body`;
        console.error(status);
        return res.status(400).send(status);
      }
  }
  if (noteId!== req.body.id) {
    const status = `Request path id (${noteId}) and request body id (${req.body.id}) must match`;
    console.error(status);
    return res.status(400).send(status);
  }
  const noteExists = db.get('notes')
  .find({id: noteId})
  .value();
  if(!noteExists){
    return res.status(400).send("Invalid ID");
  }
  console.log("note to be updated" , req.body)
  db.get("notes")
    .find({ id: noteId })
    .assign({ message: req.body.message })
    .write();
  res.status(204).end();
});

app.get("*", (req, res) => res.send("ok"));

//Runserver to launch before every test
function runServer(mode="dev"){
    const port = process.env.PORT || 8000;
    console.log("mode is", mode);
    if(mode === "test"){
        adapter = new FileSync("db/db_test.json");
    } else{
        adapter = new FileSync("db/db.json");
    }
    console.log("adapter is", adapter);
    db = low(adapter);
    db.defaults({notes:[]}).write();
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`App is listening on ${port}`);
            resolve(server)
        })
        .on("error", err => {
            reject(err)
        });
    });
}

//CloseServer to run after every test
function closeServer(){
    return new Promise((resolve, reject) => {
        console.log("closing server");
        server.close(err => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
}

//Needed for direct invocation eg: "node server.js"
if (require.main === module) {
    runServer().catch(err => console.error(err));
  }

module.exports = {app, runServer, closeServer}