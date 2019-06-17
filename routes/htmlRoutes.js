var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
var ObjectId = require('mongodb').ObjectID;
var mongodb = require('mongodb');

module.exports = function (app) {
  // A GET route for scraping the echoJS website
  app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://seekingalpha.com/market-news/all").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $(".mc").each(function (i, element) {
        // Save an empty result object
        var result = {};
        //element.children[1].children = <div class="title"
        //element.children[1].children[0] = <a "
        //element.children[1].children[1] = <div class="bullets"
        let set_max_articles = 20
        if (i < set_max_articles && i != 4) {
          result.title = element.children[1].children[0].children[0].children[0].data;
          result.link = "https://seekingalpha.com" + element.children[1].children[0].children[0].attribs.href;
          result.issaved = 0;
          //Create a new Article using the `result` object built from scraping
          db.Article.find({ title: result.title })
            .then(function (dbArticle) {
              // View the added result in the console
              if (dbArticle.length == 0) {
                db.Article.create(result)
                  .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                    if (i == set_max_articles - 1) {
                      res.redirect('/');
                    }

                  })
                  .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                  });
              }

            })
            .catch(function (err) {
              // If an error occurred, log it
              console.log(err);
            });

          // db.Article.create(result)
          //   .then(function (dbArticle) {
          //     // View the added result in the console
          //     console.log(dbArticle);
          //   })
          // .catch(function (err) {
          //   // If an error occurred, log it
          //   console.log(err);
          // });


        }



        // Add the text and href of every link, and save them as properties of the result object
        // result.title = $(this)
        //   .children("a")
        //   .text();
        // result.link = $(this)
        //   .children("a")
        //   .attr("href");


      });

      // Send a message to the client

    });

  });

  // Route for getting all Articles from the db
  app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for getting all Articles from the db
  app.get("/articles/saved", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({ issaved: 1 })
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function (dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.post("/articles/deletenote/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    console.log("Delete note req.body: ",req.body)
    // Create a new note and pass the req.body to the entry
    var setvaltoblank = {
      title:"",
      body:""
    }

    db.Note.create(setvaltoblank)
      .then(function (dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function (dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


  app.post("/articles/save/:id", function (req, res) {
    console.log("req.body: ", req.body)

    db.Article.updateOne({ "_id": req.body.id }, { $set: { "issaved": req.body.val } })
      .then(function (dbArticle) {
        // View the added result in the console
        console.log("dbArticle", dbArticle);

      })
      .catch(function (err) {
        // If an error occurred, log it
        console.log(err);
      });

  });



  app.post("/articles/removesave/:id", function (req, res) {
    console.log("req.body: ", req.body)

    db.Article.updateOne({ "_id": req.body.id }, { $set: { "issaved": req.body.val } })
      .then(function (dbArticle) {
        // View the added result in the console
        console.log("dbArticle", dbArticle);

      })
      .catch(function (err) {
        // If an error occurred, log it
        console.log(err);
      });

  });

};

