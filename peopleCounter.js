
var peopleCounter = function()
{
	this.calculateAcoustic = function(acusticData){
		
		var data =[0,0,0,0,0,0,0,0];
		var lenghts =[0,0,0,0,0,0,0,0];
		for(var i=0;i<acusticData.length;i++)
		{
			
			for(var j = acusticData[i].length-2;j<acusticData[i].length;j++)
			{
				data[j]+= parseInt(acusticData[i][j]);
			}
		}
		 // for(var i=0;i<data.length;i++)
		// {
			// if(data[i]<acusticData.length/2)
			// {
				// data[i] = 0;
			// }
		// }
		var signalCount=0;
		
		if(data[6]!=0 || data[7]!=0)
		{
			signalCount = 1;
		}
		if(isNaN(signalCount))
		{
			signalCount = 0;
		}
		var result = signalCount;
		if(isNaN(result))
		{
			result = 0;
		}
		return result;
	}
	this.calculateMerge = function(acustic,faces)
	{
		var dataAc = acustic;
		var dataFa = faces;
		if(isNaN(dataAc))
		{
			dataAc = 0;
		}
		if(isNaN(dataFa))
		{
			dataFa = 0;
		}
		var result = Math.max(dataAc,dataFa);
		return result;
	}
}
module.exports = peopleCounter;