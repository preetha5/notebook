const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const FileAsync = require('lowdb/adapters/FileAsync')
const Notes = require('./model/notes');


const app = express();

//Middleware, Logging
app.use(morgan("common"));
app.use(express.static("public"));
app.use(jsonParser);

const adapter = new FileSync("db/db.json");
//const adapter = new FileAsync("db/db.json");
const db = low(adapter);

//Routes

app.get("/", (req, res) => {
  res.send("index.html");
});

function mySearch(query) {
  return function(element) {
    console.log("query is", query)
    console.log("message is ", element.message);
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
    console.log("filtered ", filtered);
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
            id:Date.now(),
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

// app.delete('/notes', jsonParser, (req,res)=> {
//     const id_arr = req.body.id_array;
//     let invalid_id =[];
//     let valid_id = [];
//     for (noteId of id_arr){
//        return Notes.checkIdExists(noteId)
//        .then((resp)=>{
//         console.log("resp ", resp)
//         if(!resp){
//                 invalid_id.push(noteId)
                
//         } else{
//                 valid_id.push(noteId);
//         }
//        })    
//     }

//     console.log("valid_id ", valid_id);
//     if (valid_id.length>0){
//         for (id of valid_id){
//             Notes.deleteNote(id)
//             .then((resp) => {
//                 console.log("delete resp ", resp)
//                 res.json('Item deleted')
//             })
//             .catch(err => {
//                 console.error(err.message);
//                 res.status(500).send(err.message)
//             })
//         }
// }

//     if(invalid_id.length){
//         const message = `Unable to find notes with ID ` + invalid_id.join(',');
//         console.error(message);
//        res.status(400).send(message);
//     }
//})

//DELETE ONE NOTE
app.delete("/notes/:id", (req, res) => {
    //TBD: check if the ID exists
    const noteId = parseInt(req.params.id);
    console.log("id to remove:", noteId);
    if(!Notes.checkIdExists(noteId)){
        return res.status(400).send("invalid id")
    };
    
    Notes.deleteNote(noteId)
    .then(()=>{
        res.json('Item deleted')
    })
    .catch(err => res.status(500).send(err.message))
  });

//UPDATE A NOTE
app.put("/notes/:id", jsonParser, (req, res) => {
  const noteId = parseInt(req.params.id);
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

//UNDOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO LATER
// db.defaults({notes:[]}).write()

//Runserver to launch before every test
function runServer(){
    const port = process.env.PORT || 8000;
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

//Closeserver to run after every test
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

//Needed for direct invokation eg: "node server.js"
if (require.main === module) {
    runServer().catch(err => console.error(err));
  }

module.exports = {app, runServer, closeServer}