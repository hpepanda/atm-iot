
var acustic = function(sensorsCount)
{
	var dataCollection = [];
	this.addData = function(data){
		if(data == undefined)
			return;
		for(var i =0; i< data.length;i++){
			if(data[i].length == sensorsCount)
			{
				dataCollection.push(data[i]);
			}
		}
		//console.log(dataCollection.length);
	};
	this.getData = function(){
		return dataCollection;
	}
	this.clear = function()
	{
		dataCollection = [];
	}
}
module.exports = acustic;