function addNoteListener() {
  $("#btn_submit").click(e => {
    e.preventDefault();
    const notes = $("#note_input")
      .val()
      .split(",");
    $("#note_input").val("");
    const message = {
      notes_array: notes
    };
    //Make an ajax post request with new user details to register
    $.ajax({
      type: "POST",
      url: "/notes",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(message),
      processData: false
    })
      .then(() => {
        loadNotes();
      })
      .catch(err => console.error(err));
  });
}

function loadNotes() {
  const allNotes = $("#allNotes");
  allNotes.empty();
  //Make an ajax post request with new user details to register
  $.ajax({
    url: "/notes"
  })
    .then(data => {
      for (let item of data) {
        const row = $(`<li>`);
        row.attr("id", item.id);
        const check = '<input type="checkbox" />';
        row.append(check);
        row.append(`<div class="note"><p class="message" contenteditable="true">${
          item.message
        } </p>
              <input type="submit" class="btn_save" value="Save" name="save_button"></input></div>`);
        allNotes.append(row);
      }

      //If notes are retreived show a delete button
      if ($(allNotes).children().length > 0) {
        allNotes.append(
          '<button class="btn_delSelected">Delete Selected</button'
        );
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function deleteNotesListener() {
  $("#allNotes").on("click", ".btn_delSelected", event => {
    const deleteArr = [];
    //accumulate checked notes
    const checkedNotes = $("#allNotes li input[type='checkbox']:checked");
    checkedNotes.each((index, elem) => {
      deleteArr.push(
        $(elem)
          .parent()
          .attr("id")
      );
    });
    console.log("IDs to delete", deleteArr);
    //Make an ajax post request with new user details to register
    $.ajax({
      type: "DELETE",
      url: "/notes",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({ id_array: deleteArr })
    }).then(() => {
      loadNotes();
    });
  });
}

function searchNotesListener() {
  $("#search_form").submit(e => {
    e.preventDefault();
    //Empty result status if any
    $("div.status").empty();
    const query = JSON.stringify(
      $("#search_query")
        .val()
        .split(",")
    );
    $("#search_query").val("");
    $.ajax({
      url: `/notes?search=${query}`
    })
      .then(data => {
        console.log(data);
        //Clear the existing notes
        const allNotes = $("#allNotes");
        allNotes.empty();
        if (!data.length) {
          $("div.status").html(`No notes found containing terms ${query}`);
        }
        for (let item of data) {
          const row = $(`<li>`);
          row.attr("id", item.id);
          const check = '<input type="checkbox" />';
          row.append(check);
          row.append(`<div class="note"><p class="message" contenteditable="true">${
            item.message
          } </p>
              <input type="submit" class="btn_save" value="Save" name="save_button"></input></div>`);
          allNotes.append(row);
        }
        //If notes are retreived show a delete button
        if ($(allNotes).children().length > 0) {
          allNotes.append(
            '<button class="btn_delSelected">Delete Selected</button'
          );
        }
      })
      .catch(err => {
        console.log(err);
        $("div.status").html(err);
      });
  });
}

function editNoteListener() {
  $("#allNotes").on("click", ".message", function(e) {
    //hide all save button if visible
    $(".btn_save").each((i, elem) => {
      $(elem).css("opacity", 0);
    });
    const SaveButton = $(e.currentTarget).next();
    SaveButton.animate({
      opacity: 1
    });
  });
}

function saveBtnListener() {
  $("#allNotes").on("click", ".btn_save", function(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    //Empty result status if any
    $("div.status").empty();

    //find the corresponding LI element for the save btn
    const parent = $(btn).parents("li");
    const id = parent.attr("id");
    //Send updated note to server
    const message = $(btn)
      .prev()
      .html()
      .trim();
    console.log(message);
    const newMessage = {
      id: id,
      message: message
    };
    //Make an ajax post request with new user details to register
    $.ajax({
      type: "PUT",
      url: `/notes/${id}`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(newMessage)
    })
      .then(() => {
        loadNotes();
      })
      .catch(err => {
        console.error(err);
        $("div.status").html(err);
      });

    //hide the save button
    $(btn).css("opacity", 0);
  });
}

$(function() {
  addNoteListener();
  loadNotes();
  deleteNotesListener();
  searchNotesListener();
  editNoteListener();
  saveBtnListener();
});
