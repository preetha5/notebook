const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const low = require("lowdb");
const app = express();

//Global defines
var db;

const notesRouter = require('./routes');


//Middleware, Logging
app.use(morgan("common"));
app.use(express.static("public"));
app.use(jsonParser);

//Routes
app.get("/", (req, res) => {
  res.send("index.html");
});

app.use('/notes', notesRouter);

app.get("*", (req, res) => res.send("ok"));

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

//Needed for direct invokation eg: "node server.js"
if (require.main === module) {
    runServer().catch(err => console.error(err));
  }

module.exports = {app, db, runServer, closeServer}