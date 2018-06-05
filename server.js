// Mongo News Scraper 

// NPM Packages------------------------------
// server package
var express = require("express");
//var request = require("request");*****replace w axios 
// html page templates
var handlebars = require("express-handlebars");
// ODM for Mongo
var mongoose = require("mongoose");
// form submission
var bodyParser = require("body-parser");
// scraping tools
var cheerio = require("cheerio");
var axios = require("axios");
// log requests
var logger = require("morgan");
//--------------------------------------------

// Mongoose Models
var db = require("./models")


// Define Port
var PORT =  process.env.PORT || 3000;
    
// Initialize Express
var app = express();


// Use morgan logger for logging requests
app.use(logger("dev"));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({extended: true}));

// Set up the public folder for static files
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");
//app.set('views', path.join(__dirname, 'views'));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//  Mongo DB connection ------------------------ 
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// --------------------------------------------




// MAIN route  -- default "/"
app.get("/", function(req, res) {
   res.render('index'); 
});

// SCRAPE route
app.get("/scrape", function(req,res){

    // Scrape for news------------------------------
    axios.get("http://www.smashingmagazine.com/articles").then(function(response) {
    
        // Load the HTML into cheerio 
        var $ = cheerio.load(response.data);

        // Scrape for latest posted articles
        $("article.article--post").each(function(i, element) {
            // Array for scraped data 
            var results = {};

            results.link = "https://www.smashingmagazine.com" + $(this).children("h1").children("a").attr("href");
            results.title = $(this).children("h1").text();
            results.summary = $(this).children("div").children("p").text();

            console.log(results.link + "\n" + results.title + "\n" +results.summary);
            // Create new Article from model using results
            if (results.title && results.link && results.summary){
                db.Article.create(results) 
                .then(function(dbArticle){
                    console.log(dbArticle);
                })
                .catch(function(err){
                    return res.json(err);
                });
            }

        });

        // Log the results once you've looped through each of the elements found with cheerio
        res.send("Scrape Complete");//****change msg***/
        });
    //--------------------------------------
});

//  ALL ARTICLE LIST route
app.get("/articles", function(res, req){
    // Find all articles in Articles collection
    db.Article.find({})
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        // Or send error 
        res.json(err);
    });
});

// SPECIFIC ARTICLE LIST route
app.get("/articles/:id", function(res,req){
    // Find requested article in Articles collection
    db.Article.findOne({_id: req.params.id })
      .populate("note")
      // and add note to result if one exists
      .then(function(dbArticle){
          res.json(dbArticle);
      })
      .catch(function(err){
        // Or send error 
        res.json(err);
    });
});

// Update Article's associated Note route
app.post("/articles/:id"),function(res, req){
    db.Note.create(req.body)
    .then(function(dbNote){
        // update Article 
       return db.Article.findOneAndUpdate(
           {_id: req.params.id }, 
           {note: dbNote_id }, 
           { new: true});
    })
    .then(function(dbArticle){
        // Send article to client
        res.json(dbArticle);
    })
    .catch(function(err){
        // Or send error 
        res.json(err);
    });
}


// Activate Server : Begin listening

app.listen(PORT, function(){
    console.log("App is running on port " + PORT + "!");  
});