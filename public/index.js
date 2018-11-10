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
          });

    })
}

$(function(){
    addNoteListener();
})