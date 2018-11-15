const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const low = require("lowdb");
const app = express();
const { PORT } = require('./config');

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
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => {
            console.log(`App is listening on ${PORT}`);
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