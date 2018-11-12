# Notebook
## Table of Contents

1. [Description](#description)
2. [Demo](#demo)
3. [Technologies](#tech)
4. [API Endpoints](#api)
5. [Installing and running unit tests](#tests)
6. [Using Postman to manually check API responses](#postman)

<a name="description"></a>

## Description
Notebook is an API service to add and manage notes. Using this service you will be able to 
* Add one or notes
* Edit a note
* Get all notes
* Search for notes with keywords
* Delete one or more notes

<a name="tech"></a>

## Demo
TBD - Front end

<a name="tech"></a>

## Technology
* [NODEJS](https://nodejs.org/en/)
* [EXPRESS](https://expressjs.com/)
* [LOWDB](https://www.npmjs.com/package/lowdb)
* [CHAI](https://www.chaijs.com/) (For testing)
* CHAI HTTP ((For testing))
* MOCHA (For testing)

<a name="api"></a>

## API
Below is a list of endpoints supported by the Notebook API.

| API        | Request (Params) | Request (Body)  |Response| Description
| ------------- |:-------------:| -----:|---:|:----|
| GET | None | None |   200 | Returns all notes |
| GET | ?search={keyword1}+{keyword2} | None | 200 | Returns json array of notes 
| POST | None | "notes_array" | 201 | Returns json array of note objects 
| PUT | /:id | Object | 204 | Request body should contain object with id and message keys
| DELETE | None | "id_array" | 204 | Returns json array of notes 



<a name="tests"></a>

## Installing and running unit tests
Clone the repo locally and launch the tests. This will create a db_test JSON database for testing purposes.
``` bash 
$git clone https://github.com/preetha5/notebook.git
$npm install
$npm test
```

<a name="postman"></a>

## Using Postman to manually check API responses
Launch your server locally. It will start it in http://localhost:8000. This will let you check the endpoints in postman or curl.
``` bash
$npm start

App is listening on 8000
```

* ### GET all Notes
![Get All Notes](./screenshots/get_all_notes.JPG?raw=true "View all Notes Page")

* ### Search for notes
![Search Notes](./screenshots/search_notes.JPG?raw=true "Search Notes Page")

* ### Add note(s)
![Add Notes](./screenshots/add_notes.JPG?raw=true "Add Notes Page")


* ### Edit a Note
![Edit Note](./screenshots/edit_note.JPG?raw=true "Edit Note Page")


* ### Delete note(s)
![Delete Notes](./screenshots/delete_notes.JPG?raw=true "Delete Notes Page")



