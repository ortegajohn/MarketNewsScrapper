// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // For each one
    $("#articles").empty()
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        var article_card = $('<div class="card text-center">')
        var card_body = $('<div class="card-body">')
        var savebutton = $(`<button 
        save-data-id=${data[i]._id}
        id="savethis" 
        class="btn btn-primary">Save Article</button>`)

        var title = $("<h3 id='hasnotes' data-id='" + data[i]._id + "'>")
        title.text(data[i].title)
        var link = $(`<a href="${data[i].link}" target="_blank">`)
        link.text(data[i].link)
        console.log("title: ", title)
        console.log("link: ", link)
        //   $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        card_body.append(title)
        card_body.append(link)
        card_body.append("</br>")
        card_body.append(savebutton)
        article_card.append(card_body)
        $("#articles").append(article_card)
        // $("#articles").append(link)
    }
});

$(document).on("click", "#savethis", function (e) {
    //https://stackoverflow.com/questions/4320356/output-all-set-attributes-of-an-element
    var domElement = $(this)["0"];
    console.log("domElement.attributes[0].nodeValue: ", domElement.attributes[0].nodeValue)
    saved_id = domElement.attributes[0].nodeValue
    // console.log(a)
    $.ajax({
        method: "POST",
        url: "/articles/save/" + saved_id,
        data: {
            // Value taken from title input
            id: saved_id,
            // Value taken from note textarea
            val: 1
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log("POST save: ", data);
            // Empty the notes section

        });

})



$(document).on("click", "#delbtn", function (e) {
    //https://stackoverflow.com/questions/4320356/output-all-set-attributes-of-an-element
    console.log("DELETE HERE1")
    var domElement = $(this)["0"];
    console.log("domElement.attributes[0].nodeValue: ", domElement.attributes[0].nodeValue)
    saved_id = domElement.attributes[0].nodeValue
    // console.log(a)
    $.ajax({
        method: "POST",
        url: "/articles/removesave/" + saved_id,
        data: {
            // Value taken from title input
            id: saved_id,
            // Value taken from note textarea
            val: 0
        }
    })
        // With that done
        .then(function (data1) {
            // Log the response

            console.log("POST removesave: ", data1);
            // Empty the notes section


        });

    console.log("DELETE HERE2")
    $.getJSON("/articles/saved", function (data) {
        // For each one
        $("#articles").empty()
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            var article_card = $('<div class="card text-center">')
            var card_body = $('<div class="card-body">')
            var articlenotes = $(`<button 
                save-data-id=${data[i]._id}
                id="notebtn" 
                class="btn btn-primary">Article Notes</button>`)

            var deletefromsave = $(`<button 
                save-data-id=${data[i]._id}
                id="delbtn" 
                class="btn btn-primary">Delete From Saved</button>`)

            var title = $("<h3 id='hasnotes' data-id='" + data[i]._id + "'>")
            title.text(data[i].title)
            var link = $(`<a href="${data[i].link}" target="_blank">`)
            link.text(data[i].link)
            console.log("title: ", title)
            console.log("link: ", link)
            //   $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
            card_body.append(title)
            card_body.append(link)
            card_body.append("</br>")
            card_body.append(articlenotes)
            card_body.append(deletefromsave)
            article_card.append(card_body)
            $("#articles").append(article_card)
            // $("#articles").append(link)
        }
    });
})

// Whenever someone clicks a p tag
$(document).on("click", "#notebtn", function () {
    console.log("AAAAAAAAAAAAAAA")
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("save-data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            // The title of the article
            //build bootstrap input text box
            let inputgroup = $('<div class="input-group">')
            let prependinput = $('<div class="input-group-prepend">')
            prependinput.append('<span class="input-group-text">Note:</span>')
            let prependtitle = $('<div class="input-group-prepend">')
            prependtitle.append('<span class="input-group-text">Title:</span>')
            inputgroup.append(prependinput)
            inputgroup.append('<textarea id="bodyinput" name="body" class="form-control" aria-label="With textarea"></textarea>')
            $("#notes").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            $("#notes").append(prependtitle);
            $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body

            // $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            $("#notes").append(inputgroup);
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
            $("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");

            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
            }
        });
});

$(document).on("click", "#deletenote", function (e) {
    e.preventDefault()
    var thisId = $(this).attr("data-id");
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/deletenote/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val(),
            id:thisId

        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");

});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});


$(document).on("click", "#scrapeArticles", function (e) {
    e.preventDefault()

    $.get('/scrape')
        .then((data) => {
            $('body').html(data);
        });

});

$(document).on("click", "#getsavedArticles", function (e) {
    e.preventDefault()
    $.getJSON("/articles/saved", function (data) {
        // For each one
        $("#articles").empty()
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            var article_card = $('<div class="card text-center">')
            var card_body = $('<div class="card-body">')
            var articlenotes = $(`<button 
            save-data-id=${data[i]._id}
            id="notebtn" 
            class="btn btn-primary">Article Notes</button>`)

            var deletefromsave = $(`<button 
            save-data-id=${data[i]._id}
            id="delbtn" 
            class="btn btn-primary">Delete From Saved</button>`)

            var title = $("<h3 id='hasnotes' data-id='" + data[i]._id + "'>")
            title.text(data[i].title)
            var link = $(`<a href="${data[i].link}" target="_blank">`)
            link.text(data[i].link)
            console.log("title: ", title)
            console.log("link: ", link)
            //   $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
            card_body.append(title)
            card_body.append(link)
            card_body.append("</br>")
            card_body.append(articlenotes)
            card_body.append(deletefromsave)
            article_card.append(card_body)
            $("#articles").append(article_card)
            // $("#articles").append(link)
        }
    });

});

$(document).on("click", "#home", function (e) {
    e.preventDefault()
    $.getJSON("/articles", function (data) {
        // For each one
        $("#articles").empty()
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            var article_card = $('<div class="card text-center">')
            var card_body = $('<div class="card-body">')
            var savebutton = $(`<button 
            save-data-id=${data[i]._id}
            id="savethis" 
            class="btn btn-primary">Save Article</button>`)

            var title = $("<h3 id='hasnotes' data-id='" + data[i]._id + "'>")
            title.text(data[i].title)
            var link = $(`<a href="${data[i].link}" target="_blank">`)
            link.text(data[i].link)
            console.log("title: ", title)
            console.log("link: ", link)
            //   $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
            card_body.append(title)
            card_body.append(link)
            card_body.append("</br>")
            card_body.append(savebutton)
            article_card.append(card_body)
            $("#articles").append(article_card)
            // $("#articles").append(link)
        }
    });
});

