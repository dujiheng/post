var gl;
var model1;

var InitDemo = function()
{
	loadTextResource('./shader.vs.glsl', function (vsErr, vsText){
		if(vsErr)
		{	
			alert('Fatal error getting vertex shader (see console)');
			console.error(vsErr);
		}
			else
			{
				loadTextResource('./shader.fs.glsl',function(fsErr, fsText){
					if(fsErr)
					{
						alert('Fatal error getting fragment shader (see console)');
						console.error(fsErr);
					}
						else
						{
							loadJSONResource('./monkey.json', function(modelErr, modelObj){
								if(modelErr)
								{
									alert('Fatal error getting model (see console)');
									console.error(modelErr);
								}
								else
									{
										RunDemo(vsText, fsText, modelObj);
									}
								});
						}
				});
			}
		});

};




var RunDemo = function(vertexShaderText, fragmentShaderText ,SusanModel){
	console.log('This is working');
	model1 = SusanModel;

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	if(!gl){
		console.log('webgl not supported,failling back on experimental-webgl')
		gl = canvas.getContext('exper imental-webgl');
	}
	if(!gl){
		alert('Your browser does not suppose webgl');
	}

//	canvas.width = window.innerwidth;
//	canvas.height = window.innerHeight;
//	gl.viewPort(0,0,window.innerWidth,window.winnerHeight);

	gl.clearColor(0.75,0.85,0.8,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK)
	//
	//create shader
	//
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader,vertexShaderText);
	gl.shaderSource(fragmentShader,fragmentShaderText);

	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
		console.error('ERROR compiling vertex shader!',gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
	}


	var program = gl.createProgram();
	gl.attachShader(program,vertexShader);
	gl.attachShader(program,fragmentShader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('ERROR linking program',gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error('ERROR validataing program!',gl.getProgramInfoLog(program));
		return;
	}
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader)


	//
	//Create buffer
	//
	var susanVertices = SusanModel.meshes[0].vertices;
	var susanIndices = [].concat.apply([],SusanModel.meshes[0].faces);
	var susanTexCoords = SusanModel.meshes[0].texturecoords[0];

	var susanPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(susanVertices), gl.STATIC_DRAW);

	var susanTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);

	var susanIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,susanIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(susanIndices), gl.STATIC_DRAW);
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	var positionAttribLocation = gl.getAttribLocation(program,'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation,  // Attribute location
		3,	// Number of elements per attribute
		gl.FLOAT,  // type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT,  //size of individual vertex
		0  // offset frome the begining of a single vertex to zhis attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);	

	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	var vertTexAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		vertTexAttribLocation,
		2,
		gl.FLOAT,
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.enableVertexAttribArray(vertTexAttribLocation);

	//
	// create texture 
	//

	var monkeyTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, monkeyTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById('appearance')
	);
	gl.bindTexture(gl.TEXTURE_2D,null);


	
	//Tell opengl state machine which programe should be active
	gl.useProgram(program);


	var matmodelUniformLocation = gl.getUniformLocation(program, 'model');
	var matviewUniformLocation = gl.getUniformLocation(program, 'view');
	var matProjectionUniformLocation = gl.getUniformLocation(program, 'projection');
	

	var modelMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projectionMatrix = new Float32Array(16);
	mat4.identity(modelMatrix);
	mat4.lookAt(viewMatrix, [0,0,-8], [0,0,0],[0,1,0]);
	mat4.perspective(projectionMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, 0.1 , 1000.0);

	gl.uniformMatrix4fv(matmodelUniformLocation, gl.FLASE, modelMatrix);
	gl.uniformMatrix4fv(matviewUniformLocation, gl.FLASE, viewMatrix);
	gl.uniformMatrix4fv(matProjectionUniformLocation, gl.FLASE, projectionMatrix);
	
	
	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;

	var xRotetionMatrix = new Float32Array(16);
	var yRotetionMatrix = new Float32Array(16);

	var loop = function(){
		angle = performance.now()/1000/6*2*Math.PI;
		mat4.rotate(yRotetionMatrix,identityMatrix, angle, [0,1,0]);
		mat4.rotate(xRotetionMatrix,identityMatrix, angle/4, [1,0,0]);
		mat4.mul(modelMatrix,xRotetionMatrix,yRotetionMatrix)
		gl.uniformMatrix4fv(matmodelUniformLocation, gl.FALSE, modelMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0)
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, monkeyTexture);
		

		gl.drawElements(gl.TRIANGLES,susanIndices.length, gl.UNSIGNED_SHORT,0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);


};






















