const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const { app, runServer, closeServer } = require("../server");

chai.use(chaiHttp);

describe('Notebook', function() {

    before(function(){
        return runServer(mode="test");
    })

    after(function(){
        return closeServer();
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

    it('should update an existing note' , function(){
        return chai.request(app)
                .get('/notes')
                .then((resp) =>{
                    const idEdit=resp.body[0].id
                    const updatedNote = {
                        id : idEdit,
                        message: "new test message"
                    }
                    return chai.request(app)
                            .put(`/notes/${idEdit}`)
                            .send(updatedNote)
                            .then((resp)=> {
                                expect(resp).to.have.status(204)
                            })
                })
    })

    it('should delete one or more Notes - valid ID' , function(){
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

});//End all tests