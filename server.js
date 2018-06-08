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
// log requests
var logger = require("morgan");

// scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

//--------------------------------------------

// Mongoose Models
var db = require("./models")


// Define Port
//var PORT =  process.env.PORT || 3000;
 var PORT = 3000;   
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

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//  Mongo DB connection ------------------------ 
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// --------------------------------------------
// mongoose.connect("mongodb://localhost/mongoHeadlines");

app.get('/', function (req, res){
    res.render('index');
})

app.get('/saved', function (req, res){
    res.render('savedArticles');
})

// SCRAPE route
app.get("/scrape", function(req,res){

    // Scrape for news------------------------------
    axios.get("https://www.wsj.com/news/types/technology", ).then(function(response) {
    
        // Load the HTML into cheerio 
        var $ = cheerio.load(response.data);

        // Scrape for latest posted articles
        $("div.item-container").each(function(i, element) {
            // Array for scraped data 
            var results = {};

            results.link = $(this).children("div").children("h3").children("a").attr("href");
            results.title = $(this).children("div").children("h3").text();
            results.image = $(this).children("a").children("img").attr("src");
            results.summary = $(this).children("div").children("div").children("p").text();
            //results.pubDate = $(this).children("div").children("time").children("div").text();
            
            //console.log(results.link + "\n" + results.title + "\n" +results.summary);
            // Create new Article from model using results
            if (results.title && results.link && results.summary){
                
                db.Article.create(results) 
                .then(function(dbArticle){
                    console.log(dbArticle);
                })
                .catch(function(err){
                    console.log(err);
                });
            }

        });

        // Log the results once you've looped through each of the elements found with cheerio
        res.send("scraped!");
        });
    //--------------------------------------
});

//  ALL ARTICLE LIST route
app.get("/articles", function(req, res) {
    console.log("route for articles");
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        console.log("Number of articles: " + dbArticle.length);
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// SPECIFIC ARTICLE LIST route
app.get("/articles/:id", function(req, res){
    console.log("Article ID: " + req.params.id);
    // Find requested article in Articles collection
    db.Article.findOne({_id: req.params.id })
      .populate("note")
      // and add note to result if one exists
      .then(function(dbArticle){
          res.json(dbArticle);
      })
      .catch(function(err){
        // Or send error 
        console.log(err);
    });
});

// Update Article's associated Note route
app.post("/articles/:id"),function(req, res){
    db.Note.create(req.body)
    .then(function(dbNote){
        // update Article 
       return db.Article.findOneAndUpdate(
           { _id: req.params.id }, 
           { note: dbNote_id }, 
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