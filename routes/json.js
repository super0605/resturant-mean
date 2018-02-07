const express = require('express');
const router = express.Router();
var request = require('request');
var http = require('http');
var url = require('url');
var prePath = './public/json';
var fs = require('fs');
var mime = require('mime');
var path = require('path');
const config = require('../config/database');
const itemDB = require('../models/menu_items');
const categoryDB = require('../models/category');
var cache = {};

function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}
function sendFile(response, filePath, fileContents,param) {
	if (filePath == './public/json/menu_items.json')
		fileContents = getJsonData(fileContents,param);
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
	// response.end(fileContents);
}
function getJsonData(fileContents,param){
	var data = JSON.parse(fileContents).menu_items;
	var temp = [];
	for (var i in data){
		if (data[i].short_name.indexOf(param.category) === 0)
			temp.push(data[i]);
	}
	return JSON.stringify({'menu_items':temp});
}
function serveStatic(response, cache, absPath,param) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath],param);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data,param);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

function downloadJsonData(){
	var path = prePath + '/menu_items.json';
	fs.exists(path, function(exists) {
		if (exists) {
			fs.readFile(path, function(err, data) {
				if (err) {
					// send404();
				} else {
					downLoad(path,data);
				}
			});
		} else {
			// send404(response);
		}
	});
}
var timer;
function downitem(ary){
	if (ary.length == 0) return;
	var sourcepath = 'https://jo-coursera5.herokuapp.com';

	item = ary.pop();
	// var filename = sourcepath + '/menu_items/' + item.short_name + '.json';
	var filename = sourcepath + '/images/' + item.short_name + '.jpg';
	var target = prePath + '/images/' + item.short_name + '.jpg';
	fs.exists(target,function(exists){
		if (exists){
			if (timer)
				clearTimeout(timer);
			timer = setTimeout(downitem,0,ary);
		}else{
			fs.readFile('./public/json/images/test.jpg', function (err, data) {
				fs.writeFile(target,data,function(err){
					downitem(ary);
					if (err) throw err;
				});
			});
		}
	});
}
function downLoad(path,data){
	var items = JSON.parse(data).menu_items;
	downitem(items);
}

/* Get categories. */
router.get('/categories', function(req, res, next) {
	var param = req.query;
	categoryDB.getCategories(null,(err, data) => {
    if (err) {
      console.error(` Error in fetching blogs
        ${err}`);
        res.json({
          success: false,
          msg: 'An error occured',
        });
    } else {
      res.send(data);
    }
  });
});
/* Get menu_items. */
router.get('/menu_items', function(req, res, next) {
	var param = req.query;
	// var filePath = prePath + req.route.path + '.json';
	itemDB.getMenuItems(param.category,(err, data) => {
		if (err) {
			console.error(` Error in fetching blogs  ${err}`);
			res.json({
				success: false,
				msg: 'An error occured',
			});
		} else {
			res.send({'menu_items':data});
		}
	});
});
/* Get category items. */
router.get('/category_items', function(req, res, next) {
	var param = req.query;
	if (param.category){
		categoryDB.getCategories(param.category,(err, data) => {
	    if (err) {
	      console.error(` Error in fetching blogs
	        ${err}`);
	        res.json({
	          success: false,
	          msg: 'An error occured',
	        });
	    } else {
	      res.send(data);
	    }
	  });
	}else
		res.end();
});
//delete category
router.post('/delcategory',function(req,res){
	var category = req.body[0];
	deletecategory(category,res);
	// res.writeHead(200, {'Content-Type': 'text/plain'});
	// res.end();
});
//delete item
router.post('/delitem',function(req,res){
	var shortname = req.body.shortname;
	deleteitem(shortname,res);
})
var deleteitem = function (shortname,res){
	var imgpath = prePath + '/images/' + shortname + '.jpg';
	deletefile(imgpath);
	itemDB.deleteMenuItem(shortname,(err, data) => {
		if (err) {
			console.error(` Error in fetching blogs  ${err}`);
			res.json({
				success: false,
				msg: 'An error occured',
			});
		} else {
			res.send({'shortname':shortname});
		}
	});
}
var deletecategory = function (category,res){
	var shortname = category.short_name;
	var id = category.id;
	itemDB.getMenuItems(shortname,(err, data) => {
		if (err) {
			console.error(` Error in fetching blogs  ${err}`);
			res.json({
				success: false,
				msg: 'An error occured',
			});
		} else {
			var itemdata = data;
			for (var i in itemdata){
				var ishortname = itemdata[i].short_name;
				var compare = ishortname.substr(0,shortname.length);
				var otherstr = ishortname.substr(shortname.length,ishortname.length-shortname.length);
				if (shortname==compare && parseInt(otherstr)!=NaN){
					// categoryItems.push(itemdata[i]);
					var imgfilepath = prePath + '/images/' + ishortname + '.jpg';
					deletefile(imgfilepath);
				}
				// else {
				// 	otherItems.push(itemdata[i]);
				// }
			}
			var imgfile = './public/images/menu/' + shortname + '/' + shortname + '.jpg';
			fs.unlinkSync(imgfile);
			var imgdir = './public/images/menu/' + shortname;
			fs.rmdirSync(imgdir);
			itemDB.deleteMenuItems(shortname,(err,data)=>{
				categoryDB.deleteCategory(shortname,(err,data)=>{
					res.send({'menu_items':data});
				})
			})
		}
	});
}
var setMenuItemsInfo = function (data){
	var absPath = prePath + '/menu_items.json';
	var obj = {};
	obj.menu_items = data;
	fs.writeFileSync(absPath,JSON.stringify(obj));
	return;
}
var deletefile = function(file){
	fs.unlinkSync(file);
	return;
}
var getMenuItemsInfo = function(){
	var absPath = prePath + '/menu_items.json';
	var flag = fs.existsSync(absPath);
	if (flag){
		var data = JSON.parse(fs.readFileSync(absPath)).menu_items;
		return data;
	}else {
		return false;
	}
}
var deleteInfo = function(shortname){
	var data = getCategoriesInfo();
	var otherData = [];
	for (var i in data){
		if (data[i].short_name == shortname)
			continue;
		otherData.push(data[i]);
	}
	var absPath = prePath + '/categories.json';
	fs.writeFileSync(absPath,JSON.stringify(otherData));
	return;
}
var getCategoriesInfo = function(){
	var absPath = prePath + '/categories.json';
	var flag = fs.existsSync(absPath);
	if (flag){
		var data = JSON.parse(fs.readFileSync(absPath));
		return data;
	}else {
		return false;
	}
}
var bodyParser = require('body-parser');
var multer  = require('multer');

var app = express();

app.use(function(req, res, next) { //allow cross origin requests
	res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
	res.header("Access-Control-Allow-Origin", "http://localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// var app = express()
app.use(bodyParser.json())

var storage = multer.diskStorage({ //multers disk storage settings
	destination: function (req, file, cb) {
		var dirpath = './public/images/menu/' + req.body.short_name;
		if (!fs.existsSync(dirpath))
			fs.mkdirSync(dirpath);
		cb(null, dirpath);
	},
	filename: function (req, file, cb) {
		var datetimestamp = Date.now();
		var rfilename = req.body.short_name + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
		cb(null, rfilename);
	}
});

var upload = multer({ //multer settings
				storage: storage
			}).single('file');

/** API path that will upload the files */
router.post('/addcategory', function(req, res) {
	upload(req,res,function(err){
		if(err){
			 res.json({error_code:1,err_desc:err});
			 return;
		}
		//  res.json({error_code:0,err_desc:null});
		 var param = req.body;
		 addCategorys(param,res);
	});
});
var addCategorys = function (param,res){
	param.special_instructions = '';
	param.url = '';
	categoryDB.insertCategory(param,(err,data)=>{
		res.send({'menu_items':data});
	})
}
var oldfilename = '';
var storage2 = multer.diskStorage({ //multers disk storage settings
	destination: function (req, file, cb) {
		var dirpath = './public/json/tempimages/';
		if (!fs.existsSync(dirpath))
			fs.mkdirSync(dirpath);
		cb(null, dirpath);
	},
	filename: function (req, file, cb) {
		var datetimestamp = Date.now();
		var rfilename = 'uploadtemp.' + file.originalname.split('.')[file.originalname.split('.').length -1];
		oldfilename = './public/json/tempimages/' + rfilename;
		cb(null, rfilename);
	}
});

var upload2 = multer({ //multer settings
	storage: storage2
}).single('file');

/** API path that will upload the files */
router.post('/additem/', function(req, res) {
	upload2(req,res,function(err){
		if(err){
			 res.json({error_code:1,err_desc:err});
			 return;
		}
		res.json({error_code:0,err_desc:null});
		var param = req.body;
		addItems(param,res);
	});

});
var getSubId = function (shortname,del){
	if (typeof(shortname) == 'string'){
		var subid = parseInt(shortname.substr(del.length,shortname.length-del.length));
		if (subid != NaN && shortname.substr(0,del.length) == del)
			return subid;
	}
	return 0;
}

var addItems = function (param,res){
	var absPath = prePath + '/menu_items.json';
	// itemDB.getMenuItems()
	// fs.exists(absPath, function(exists) {
	// 	if (exists) {
	itemDB.getMenuItems(param.category_short_name,(err,data)=>{
		// var data = JSON.parse(fileContents);
		var maxid = 0;
		var submaxid = 0;
		var itemdata = data;
		for (var i in itemdata){
			if (parseInt(itemdata[i].id)>maxid)
			maxid = parseInt(itemdata[i].id);
			var subid = getSubId(itemdata[i].short_name,param.category_short_name);
			if (subid > submaxid)
			submaxid = subid;
		}
		maxid++;submaxid++;
		param.short_name = param.category_short_name + submaxid;
		param.id = maxid;
		if (param.price_small)
		param.price_small = parseInt(param.price_small);
		if (param.price_large)
		param.price_large = parseInt(param.price_large);
		delete param.category_short_name;
		itemDB.insertMenuItem(param,(err,data)=>{
			var ext = oldfilename.split('.').pop();
			fs.rename(oldfilename,prePath+'/images/'+param.short_name+'.'+ext);
			res.send({'menu_item':data});
		})
		// itemdata.push(param);
		// data.menu_items = itemdata;
		// fs.writeFile(absPath,JSON.stringify(data),'utf8',function(err){
		// 	if (err) throw err;
		// 	param.created_at = Date();
		// 	fs.writeFile(prePath+'/menu_items/'+param.short_name+'.json',JSON.stringify(param),'utf8',function(err){
		// 		if (err) throw err;
		// 	});
		// });

	});
			// fs.readFile(absPath, function(err, fileContents) {
			// 	if (err) {
			// 		// send404(response);
			// 	} else {
			// 	}
			// });
	// 	} else {
	// 		// send404(response);
	// 	}
	// });
}


module.exports = router;
