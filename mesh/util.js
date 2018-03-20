//load a text resource from a file over the network

var loadTextResource = function(url,callback)
{
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function()
	{
		if(request.status < 200 || request.status >= 300)
		{
			callback('Error: HTTP status' + request.status + 'on resource' + url);
		}
		else
		{
			callback(null, request.responseText);
		}
	};

	request.send();
};







var loadJSONResource = function (url, callback)
{
	loadTextResource(url, function(err, result)
	{	
		if(err)
		{
			callback(err);
		}
			else
			{
				try
				{
					callback(null, JSON.parse(result));
				}catch(e)
				{
					callback(e);
				}
			}

	});
	
};


