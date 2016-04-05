var imageSender = function(websocket)
{
	var fs = require("fs");
	this.sendBybase64 = function(filename,count)
	{
		var resultStr = "";
		fs.readFile(filename, 'binary', function(err, original_data){
			  resultStr = new Buffer(original_data, 'binary').toString('base64');
			  websocket.send({"image":resultStr,"count":count});
		});
	};	
};
module.exports = imageSender;