var exec = require('child_process').exec,
    child;

var imageServer = function()
{
	var data = 0;
	this.CalculateFaces = function(count)
	{
		child = exec(__dirname+'\\ImageServer\\FaceDef.exe '+count,
			function (error, stdout, stderr) {
				data = parseInt(stdout);
				//console.log('stderr: ' + stderr);
				if (error !== null) {
				console.log('exec error: ' + error);
			}
		});
		return data;
	}
}
module.exports = imageServer;