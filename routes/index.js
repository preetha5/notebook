const express = require("express");
const router = express.Router();
const shortId = require("shortid");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { db } = require("../model");

//Custom Search function for array filter
function mySearch(query) {
  
  return function(element) {
    let found = true;
    for (let item of query) {       
      if (element.message.search(item) == -1) {
        found = false;
        break;
      }
    }
    return found;
  };
}

//GET ALL NOTES
router.get("/", (req, res) => {
  if (req.query["search"]) {
    const search_arr = JSON.parse(req.query.search);
    console.log("search_arr ", search_arr);
    let notes_arr = [];
    //for(let word of search_arr){
    //console.log("word is ", word);
    const filtered = db
      .get("notes")
      .filter(mySearch(search_arr))
      .value();
    console.log("obj added to notes_arr ", filtered);
    notes_arr = [...filtered];
    // }
    // const filtered = db
    //   .get("notes")
    //   .filter(mySearch(req.query["search"]))
    //   .value();
    res.send(notes_arr);
  } else {
    const notes = db.get("notes").value();
    res.send(notes);
  }
});

//GET NOTE WITH ID
router.get("/:id", (req, res) => {
  const noteId = req.params.id;
  console.log("id is:", noteId);
  const note = db
    .get("notes")
    .find({ id: noteId })
    .value();
  if (note) {
    console.log("found note with id ", note);
    res.send(note);
  } else {
    res.status(500).send("Error: Invalid input");
  }
});

//ADD ONE OR MORE NOTES
//Request body contains an array of strings to be added
router.post("/", jsonParser, (req, res) => {
  let badRequest = null;
  //Check validations on request
  if (!("notes_array" in req.body)) {
    badRequest = `Missing 'notes_array' in request body`;
  } else if (!Array.isArray(req.body.notes_array)) {
    badRequest = `notes_array should be of type "array"`;
  } else if (!req.body.notes_array.length) {
    badRequest = `notes_array cannot be empty`;
  }
  if (badRequest) {
    console.error(badRequest);
    return res.status(400).send(badRequest);
  }
  const notes_array = req.body.notes_array;
  const newNotes = [];
  for (let item of notes_array) {
    const newNote = {
      id: shortId.generate(),
      message: item
    };
    try {
      db.get("notes")
        .push(newNote)
        .write();
      newNotes.push(newNote);
    } catch (err) {
      console.error(err);
      res.status(500);
    }
  }
  res.status(201).send(newNotes);
});

//DELETE ONE OR MORE NOTES
//Request body contains an array of ID's to be deleted
router.delete("/", jsonParser, (req, res) => {
  const id_arr = req.body.id_array;
  let not_found = [];
  for (noteId of id_arr) {
    let item = db
      .get("notes")
      .find({ id: noteId })
      .value();
    if (!item) {
      console.log("item ", item);
      not_found.push(noteId);
      continue;
    }
    console.log("removing note", noteId);
    try {
      db.get("notes")
        .remove({ id: noteId })
        .write();
    } catch (err) {
      console.log(err);
      not_found.push(noteId);
    }
  }

  if (not_found.length) {
    console.log(not_found);
    const message = `Unable to delete notes with ID ` + not_found.join(",");
    console.error(message);
    res.status(500).send(message);
  } else {
    res.status(204).end();
  }
});

//UPDATE A NOTE
router.put("/:id", jsonParser, (req, res) => {
  const noteId = req.params.id;
  //Check for required keys from req.body
  const requiredFields = ["id", "message"];
  for (field of requiredFields) {
    if (!(field in req.body)) {
      const status = `Missing "${field}" in request body`;
      console.error(status);
      return res.status(400).send(status);
    }
  }
  if (noteId !== req.body.id) {
    const status = `Request path id (${noteId}) and request body id (${
      req.body.id
    }) must match`;
    console.error(status);
    return res.status(400).send(status);
  }
  const noteExists = db
    .get("notes")
    .find({ id: noteId })
    .value();
  if (!noteExists) {
    return res.status(400).send("Invalid ID");
  }
  console.log("note to be updated", req.body);
  db.get("notes")
    .find({ id: noteId })
    .assign({ message: req.body.message })
    .write();
  res.status(204).end();
});

module.exports = router;
