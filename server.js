// index.js
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const cors = require("cors");
const path = require("path")

const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


const cheerio = require("cheerio");
const axios = require("axios");

let scrapedData = {}; // define scrapedData outside of performScraping()

async function performScraping(link) {
  const axiosResponse = await axios.request({
    method: "GET",
    url: link,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });

  var $ = cheerio.load(axiosResponse.data);
  // initializing the data structures
  // that will contain the scraped data

  var imgURL = $(".styles_mediaThumbnail__LDCQN").attr("src");
  var posterURL = $(".styles_mediaThumbnail__LDCQN").attr("poster");

  var ImgURL = imgURL ? imgURL : posterURL;
  var titleName = $("h1").text();
  var highlightName = $("h2").text();
  var descriptionName = $(
    ".styles_htmlText__d6xln, .color-darker-grey fontSize-16 fontWeight-400"
  ).text();

  var tagList = [];
  $(".styles_reset__opz7w").each((index, element) => {
    var tagVal = $(element).find("span").text();
    if (tagVal) {
      tagList.push(tagVal);
    }
  });

  // var comments = [];
  // $("#comments").find(".styles_htmlText_d6xln").each((index,element)=>
  // {
  //   var comVal = $(element).text();
  //   if(comVal)
  //   {
  //     comments.push(comVal);
  //   }
  // })

  scrapedData = {
    link: link,
    ImgURL: ImgURL,
    Title: titleName,
    Highlights: highlightName,
    Description: descriptionName,
    Taglist: tagList,
  
  };

  return scrapedData;
}

app.post("/", async (req, res) => {
  try {
    const scrapedData = await performScraping(req.body.link);
    res.json(scrapedData);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while scraping the data.");
  }
});

app.get("/api/data", function (req, res) {
  // console.log(scrapedData);
  res.json(scrapedData);
});

app.use(express.static(path.join(__dirname+ "/public")))
app.listen(PORT, function (req, res) {
  console.log("Server is running on port : " + PORT);
});
