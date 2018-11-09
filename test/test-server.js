const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const { app, runServer, closeServer } = require("../server");

chai.use(chaiHttp);

describe('Notebook', function() {

    before(function(){
        return runServer();
    })

    after(function(){
        return closeServer();
    })

    it('should return all Notes on GET', function(){
        return chai.request(app)
            .get('/notes')
            .then((res) =>{
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a("array");
                res.body.forEach((item)=>{
                    expect(item).to.be.a("object");
                    expect(item).to.have.keys("id", "message")
                })
            })
    })

    it('should add one or more notes on POST', function(){
        const arr= {
            "notes_array":["hellow 001", "hellow 002"]
            }
    
        return chai.request(app)
                .post('/notes')
                .send(arr)
                .then((res) => {
                    expect(res).to.have.status(201);
                })
    })

    it('should delete one or more Notes - valid ID' , function(){
        const input ={
            "id_array":[1541559660662, 1234]
        }
        return chai.request(app)
                .get('/notes')
                .then((resp) =>{
                    const idToDelete = {id_array: [resp.body[0].id]};
                    return chai.request(app)
                            .delete('/notes')
                            .send(idToDelete)
                            .then((res) =>{
                                expect(res).to.have.status(204)
                            })
                })
    })

    it('should update an existing note' , function(){
        return chai.request(app)
                .get('/notes')
                .then((resp) =>{
                    const updatedNote = {
                        id : resp.body[0].id,
                        message: "new test message"
                    }
                    return chai.request(app)
                            .put(`/notes/${resp.body[0].id}`)
                            .send(updatedNote)
                            .then((resp)=> {
                                expect(resp).to.have.status(204)
                            })
                })
    })

    it('should return notes based on search terms' , function(){
        return chai.request(app)
                .get('/notes?search=hellow')
                .then((resp) =>{
                   expect(resp).to.have.status(200);
                   expect(resp).to.be.json;
                    expect(resp.body.notes).to.have.lengthOf.at.least(1);
                    resp.body.notes.forEach(item  =>{
                        expect(item.message).to.have.string('hellow')
                    })
                })
    })

});//End all tests