# NewsScraper
An application to scrape the latest Tech news from the Wall Street Journal(WSJ).  The push of a button initiates the scrape for the news.  The application will scrape the WSJ web site to search for new articles, storing the articles in a collection in MongoDB and refreshing the page with the latest news added to the article listing.

## Getting Started

### Prerequisites
A Heroku account will be required for live deployment and  mLab is required to connect to the database.  

## Local Testing
Provisions are in place to run the application using PORT 3000.  

## Deployment
This application is deployed to Heroku with an mLab provision.  The connection parameters are provided by way of the process.env.MONGODB_URI.  To get the configuration, use:
heroku config:get MONGODB_URI
This will list your link
To set that configuration: 
heroku config:set MONGODB_URI=[*link*]

## Further Development

This project has coding in place that is the start of a feature to allow users to add and save a note to an article.  The feature is intended to allow the user to click anywhere in the article container to select an article, and a note textbox would then be displayed for the user to add and save their note.  Once done, that note would be visible for any user that selects that article.  

## Built With

*  NPM Packages:
    - express: for server set-up
    - express-handlebars:  page templates
    - mongoose: ODM for mongo
    - body-parser: 
    - cheerio: for web scraping
    - request: 
*  Database:  MongoDB

## Author

* **Carolyn Vasisko** - *Initial work* 
