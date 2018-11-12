const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
process.env.NODE_ENV = 'test';
const { app, runServer, closeServer } = require("../server");
const low = require("lowdb");
const {db} = require("../model");

chai.use(chaiHttp);

describe("Notebook", function() {
  before(function() {
    db.set("notes", []).write();
    return runServer();
  });

  beforeEach(function() {
    const seedArr = [
      {
        id: "abcd1234",
        message: "blue sky"
      },
      {
        id: "abcd4567",
        message: "red sky"
      }
    ];
    for (let seed of seedArr) {
      db.get("notes")
        .push(seed)
        .write();
    }
  });

  afterEach(function() {
    db.set("notes", []).write();
  });

  after(function() {
    return closeServer();
  });

  it("should add one or more notes on POST - valid", function() {
    const arr = {
      notes_array: ["hellow 001", "hellow 002"]
    };

    return chai
      .request(app)
      .post("/notes")
      .send(arr)
      .then(res => {
        expect(res).to.have.status(201);
      });
  });

  it("should throw error while adding empty array of notes", function() {
    const arr = {
      notes_array: []
    };
    return chai
      .request(app)
      .post("/notes")
      .send(arr)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.error.text).to.contain("notes_array cannot be empty");
      });
  });

  it("should return all Notes on GET", function() {
    return chai
      .request(app)
      .get("/notes")
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");
        expect(res.body).to.have.lengthOf(2);
        res.body.forEach(item => {
          expect(item).to.be.a("object");
          expect(item).to.have.keys("id", "message");
        });
      });
  });

  it("should return notes based on search terms", function() {
    return chai
      .request(app)
      .get("/notes?search=blue+sky")
      .then(resp => {
        expect(resp).to.have.status(200);
        expect(resp).to.be.json;
        expect(resp.body.notes).to.have.lengthOf.at.least(1);
        resp.body.notes.forEach(item => {
          expect(item.message).to.have.string("blue");
        });
      });
  });

  it("should update an existing note", function() {
    return chai
      .request(app)
      .get("/notes")
      .then(resp => {
        const idEdit = resp.body[0].id;
        const updatedNote = {
          id: idEdit,
          message: "new test message"
        };
        return chai
          .request(app)
          .put(`/notes/${idEdit}`)
          .send(updatedNote)
          .then(resp => {
            expect(resp).to.have.status(204);
          });
      });
  });

  it("should throw an error when editing - missing/invalid input keys", function() {
    return chai
      .request(app)
      .get("/notes")
      .then(resp => {
        const idEdit = resp.body[0].id;
        const updatedNote = {
          id: idEdit
        };
        return chai
          .request(app)
          .put(`/notes/${idEdit}`)
          .send(updatedNote)
          .then(resp => {
            expect(resp).to.have.status(400);
            expect(resp.error.text).to.contain(
              'Missing "message" in request body'
            );
          });
      });
  });

  it("should throw an error when editing - request param ID is invalid", function() {
    return chai
      .request(app)
      .get("/notes")
      .then(resp => {
        const idEdit = resp.body[0].id;
        const updatedNote = {
          id: idEdit,
          message: "new test message"
        };
        return chai
          .request(app)
          .put(`/notes/11111`)
          .send(updatedNote)
          .then(resp => {
            expect(resp).to.have.status(400);
            expect(resp.error.text).to.contain(
              `Request path id (11111) and request body id (${idEdit}) must match`
            );
          });
      });
  });

  it("should delete one or more Notes - valid ID", function() {
    return chai
      .request(app)
      .get("/notes")
      .then(resp => {
        const idToDelete = { id_array: [resp.body[0].id] };
        return chai
          .request(app)
          .delete("/notes")
          .send(idToDelete)
          .then(res => {
            expect(res).to.have.status(204);
          });
      });
  });

  it("should throw error while deleting - invalid ID", function() {
    return chai
      .request(app)
      .get("/notes")
      .then(resp => {
        const idToDelete = { id_array: ["xxxxx"] };
        return chai
          .request(app)
          .delete("/notes")
          .send(idToDelete)
          .then(res => {
            expect(res).to.have.status(500);
            expect(res.error.text).to.contain(
              "Unable to delete notes with ID xxxxx"
            );
          });
      });
  });
}); //End all tests
