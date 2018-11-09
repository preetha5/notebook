FileAsync = require('lowdb/adapters/FileAsync'),
low = require('lowdb'),
//shortId = require('shortid');



exports.getNotes = function (){
    const adapter = new FileAsync("db/db.json");
    return low(adapter)
} 

exports.checkIdExists = function (id){
    return this.getNotes()
    .then((notes_db) => {
        let item  = notes_db.has({id:id}).value();
        console.log("item ", item);
        return (item);
    })
}

exports.deleteNote = function(id){
    return this.getNotes()
            .then((notes_db) => {
                return notes_db.get('notes').remove({
                    id:id
                }).write();
            })
}

exports.deleteNotes = function(arr){
    return this.getNotes()
            .then((notes_db) => {
                return notes_db.get('notes').remove({
                    id:id
                }).write();
            })
}