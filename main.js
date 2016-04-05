var http = require('http');
var fs = require('fs');
var settings = require('./settings');
var sender = require('./objectStorageController');
var datasender = require('./dataSender');
var dataSender = new datasender();
var sendanddelete = function(){
	try{
fs.readdir(settings.dir,function(err,files){
	if(err)
	{
		console.log(err);
		return;
	}
	var outputf = [];
	for(var i=0;i<files.length;i++){
		if(files[i].search(".png")!=-1)
		{
			outputf.push(files[i]);
		}
	}
	if(outputf.length==0)
	{
		console.log("no files to delete");
		return;
	}
	outputf = outputf.sort();
	console.log("save "+ outputf[0]);
	var buf = fs.readFileSync(settings.dir + "\\"+outputf[0]);
	sender.uploadImage(outputf[0],buf,function(uri){
		dataSender.send(uri);
		for(var i=1;i<outputf.length;i++)
		{
			try{
			fs.unlinkSync(settings.dir + "\\"+outputf[i]);
			console.log("deleted "+ outputf[i]);
			}
			catch(err)
			{
				console.log(err);
			}
		}
	});
	
});
	}
	catch(err){
		console.log(err);
	}
};

setInterval(sendanddelete,settings.interval);