function addNoteListener(){
    $('#btn_submit').click((e)=>{
        e.preventDefault();
        const text = $('#note_input').val();

        const message = {
            "notes_array":[text]
            }
        //Make an ajax post request with new user details to register
        $.ajax({
            type: 'POST',
            url: '/notes',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(message),
            processData: false
          })
          .then(()=>{
            loadNotes();
          })
          .catch(err=>console.error(err));

    })
}

function loadNotes(){
    const allNotes = $('#allNotes');
    allNotes.empty();
    //Make an ajax post request with new user details to register
    $.ajax({
        url:'/notes'
      })
      .then((data) =>{
          console.log(data);
          for(let item of data){
              const row  =$(`<li>`);
              row.attr("id",item.id);
              const check = '<input type="checkbox" />';
              row.append(check);
              row.append(item.message);
              allNotes.append(row);
          }
          
      
        //If notes are retreived show a delete button
          if($(allNotes).children().length>0){
            allNotes.append('<button class="btn_delSelected">Delete Selected</button');
        }
      })
      .catch(err=>{
          console.log(err);
      })
      
}

function deleteNotesListener(){
    $("#allNotes").on("click",".btn_delSelected", (event) =>{
        const deleteArr = [];
        //accumulate checked notes
        const checkedNotes = $("#allNotes li input[type='checkbox']:checked");
        checkedNotes.each((index,elem) =>{
            deleteArr.push($(elem).parent().attr("id"));
        })
        console.log("IDs to delete", deleteArr );
        //Make an ajax post request with new user details to register
        $.ajax({
            type: 'DELETE',
            url: '/notes',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({id_array:deleteArr}),
          })
          .then(()=>{
            loadNotes();
          });
    })
}

$(function(){
    addNoteListener();
    loadNotes();
    deleteNotesListener();
})