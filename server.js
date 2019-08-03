'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const dotenv = require('dotenv');
dotenv.config();

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
});
// console.log(mongoose.connection.readyState);

const Schema = mongoose.Schema;
const urlSchema = new Schema({
	"original_url": {type: String, require: true},
	"short_url": String 
});
const Url = mongoose.model('Url', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.post("/api/shorturl/new", bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/script', express.static(process.cwd() + '/script'));

app.get('/', function(req, res){
	res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
	res.json({greeting: 'hello API'});
});


// url shortener API
app.post("/api/shorturl/new", async function(req, res) {
	const exp = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
	// var regex = new RegExp(exp);
	const url = req.body.url;
	Url.findOne({original_url: url}, (err, data) => {
		if(err) return console.log('finding err');
		if(data) {
			res.json({
				original_url: data.original_url,
				short_url: data.short_url
			});
		}
		else if(exp.test(url)) {
			(async() => {
				const numUrl = 1 + (await Url.countDocuments());
				let newUrl = new Url({
					original_url: url,
					short_url: numUrl
				});

				newUrl.save((err, data) => {
					if(err) {
						console.error('error saving');
						res.json({
							error: "Saving error!!!"
						})
					}
					res.json({
						original_url: data.original_url,
						short_url: data.short_url
					});
				})
			})();
		}
		else {
			res.json({
				error: "Invalid URL"
			})
		}
	})//end find
})

// return url list
app.get("/api/shorturl/list", (req, res) => {
	Url.find({}, "original_url short_url", (err, datas) => {
		if(err) {
			// console.log("error finding");
			res.send('Error finding');
		}
		let result = [];
		datas.map(data => result.push({
			original_url: data.original_url,
			short_url: data.short_url
		}))
		res.send(result);
	})
})

// direct from short url to original url
app.get("/api/shorturl/:shortUrl", (req, res) => {
	const shortUrl = req.params.shortUrl;
	Url.findOne({short_url: shortUrl}, 'original_url', (err, data) => {
		if(err) {
			// console.log("error finding");
			res.send('Error finding!')
		} else if(data)
		{
			// console.log("prepare directing");
			res.redirect(data.original_url);
		}
		else {
			// console.log("not found url");
			res.send("Short url not found!");
		}
	})
})


let listener = app.listen(port, function () {
	console.log('Node.js listening ...' + listener.address().port);
});

