var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec2 vertTexCoord;',
'attribute vec3 vertNormal;',
'',
'varying vec3 fragNormal;',
'varying vec2 fragTexCoord;',

'uniform mat4 model;',
'uniform mat4 view;',
'uniform mat4 projection;',
'',
'void main()',
'{',
' fragNormal = (model*vec4(vertNormal, 0.0)).xyz;',
' fragTexCoord = vertTexCoord;',
' gl_Position = projection * view * model * vec4(vertPosition,1.0);',
'}'
].join('\n');



var fragmentShaderText = 
[
'precision mediump float;',

'varying vec2 fragTexCoord;',
'varying vec3 fragNormal;',
'',
'struct CubeLight',
'{',
' vec3 direction;',
' vec3 color;',
'};',
'',
'uniform sampler2D sampler;',
'',
'uniform vec3 ambientIntensity;',
'uniform CubeLight cube;',

'',
'void main()',
'{',
' vec4 texel = texture2D(sampler, fragTexCoord);',
'',

' vec3 surfaceNormal = normalize(fragNormal);',
' vec3 normCubeDir = normalize(cube.direction);',


' vec3 lightIntensity = ambientIntensity + cube.color* max(dot(fragNormal, cube.direction),0.0);',
'',
'',
' gl_FragColor = vec4(texel.rgb + lightIntensity ,texel.a);',
'}'
].join('\n');



var InitCube = function(){
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	if(!gl){
		console.log('webgl not supported,failling back on experimental-webgl')
		gl = canvas.getContext('exper imental-webgl');
	}
	if(!gl){
		alert('Your browser does not suppose webgl');
	}


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
		var boxVertices = 
		[    // x ,y ,z  //u v   //normal 
		//top
		 -1.0, 1.0,-1.0,  0,0,    0.0, 1.0, 0.0,
		 -1.0, 1.0, 1.0,  0,1,	  0.0, 1.0, 0.0,
		  1.0, 1.0, 1.0,  1,1,    0.0, 1.0, 0.0,
		  1.0, 1.0,-1.0,  1,0,	  0.0, 1.0, 0.0,
	
		//left
		 -1.0, 1.0, 1.0,  0,0,	 -1.0, 0.0, 0.0,
		 -1.0,-1.0, 1.0,  1,0,	 -1.0, 0.0, 0.0,
		 -1.0,-1.0,-1.0,  1,1,	 -1.0, 0.0, 0.0,
		 -1.0, 1.0,-1.0,  0,1,	 -1.0, 0.0, 0.0,
	
		//right
		  1.0, 1.0, 1.0,  1,1,	  1.0, 0.0, 0.0,
		  1.0,-1.0, 1.0,  0,1,	  1.0, 0.0, 0.0,
		  1.0,-1.0,-1.0,  0,0,	  1.0, 0.0, 0.0,
		  1.0, 1.0,-1.0,  1,0,	  1.0, 0.0, 0.0,

		//front
		  1.0, 1.0, 1.0,  1,1,    0.0, 0.0, 1.0,
		  1.0,-1.0, 1.0,  1,0,    0.0, 0.0, 1.0,
		 -1.0,-1.0, 1.0,  0,0,    0.0, 0.0, 1.0,
		 -1.0, 1.0, 1.0,  0,1,	  0.0, 0.0, 1.0,

		//back
		  1.0, 1.0,-1.0,  1,1,	  0.0, 0.0,-1.0,
		  1.0,-1.0,-1.0,  0,1,	  0.0, 0.0,-1.0,
		 -1.0,-1.0,-1.0,  0,0,    0.0, 0.0,-1.0,
		 -1.0, 1.0,-1.0,  1,0,	  0.0, 0.0,-1.0,

		//bottom
		 -1.0,-1.0,-1.0,  1,1,    0.0,-1.0, 0.0,
		 -1.0,-1.0, 1.0,  0,1,    0.0,-1.0, 0.0,
		  1.0,-1.0, 1.0,  0,0,	  0.0,-1.0, 0.0,
		  1.0,-1.0,-1.0,  1,0,	  0.0,-1.0, 0.0

	];

	var boxIndices =
	[
		//top
		0,1,2,
		0,2,3,

		//left
		5,4,6,
		6,4,7,

		//right
		8,9,10,
		8,10,11,

		//front
		13,12,14,
		15,14,12,

		//back
		16,17,18,
		16,18,19,

		//bottom
		21,20,22,
		20,23,22
	];


	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(boxIndices), gl.STATIC_DRAW);
	

	var positionAttribLocation = gl.getAttribLocation(program,'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation,  // Attribute location
		3,	// Number of elements per attribute
		gl.FLOAT,  // type of elements
		gl.FALSE,
		8* Float32Array.BYTES_PER_ELEMENT,  //size of individual vertex
		0  // offset frome the begining of a single vertex to zhis attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);	


	var TexAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		TexAttribLocation,
		2,
		gl.FLOAT,
		gl.FALSE,
		8 * Float32Array.BYTES_PER_ELEMENT,
		3 * Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(TexAttribLocation);


	var NormalAttribLocation = gl.getAttribLocation(program,'vertNormal')
	gl.vertexAttribPointer(
		NormalAttribLocation,
		3 ,
		gl.FLOAT,
		gl.TURE,
		8*Float32Array.BYTES_PER_ELEMENT,
		5*Float32Array.BYTES_PER_ELEMENT
	);
	gl.enableVertexAttribArray(NormalAttribLocation);

	//
	// create texture 
	//
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
		gl.UNSIGNED_BYTE,
		document.getElementById('creat-image')
	);
	gl.bindTexture(gl.TEXTURE_2D,null);

	
	
	//Tell opengl state machine which programe should be active
	gl.useProgram(program);

	var intSamplerUniformLocation = gl.getUniformLocation(program, 'sampler');
	gl.uniform1i(intSamplerUniformLocation, 0);
	


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



	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;

	var xRotetionMatrix = new Float32Array(16);
	var yRotetionMatrix = new Float32Array(16);

	//
	//lighting information
	//
	var ambientUniformLocation = gl.getUniformLocation(program,'ambientLightIntensity');
	var cubeLightDirUniformLocation = gl.getUniformLocation(program, 'cube.direction');
	var cubeLightIntUniformLocation = gl.getUniformLocation(program, 'cube.color');

	gl.uniform3f(ambientUniformLocation, 0.2,0.2,0.2);
	gl.uniform3f(cubeLightDirUniformLocation ,3.0,3.0,2.0);
	gl.uniform3f(cubeLightIntUniformLocation ,0.3, 0.3, 0.3);


	
	//
	// Main render loop
	//
	var loop = function(){
		angle = performance.now()/1000/6*2*Math.PI;
		mat4.rotate(yRotetionMatrix,identityMatrix, angle, [0,1,0]);
		mat4.rotate(xRotetionMatrix,identityMatrix, angle/4, [1,0,0]);
		mat4.mul(modelMatrix,xRotetionMatrix,yRotetionMatrix)
		gl.uniformMatrix4fv(matmodelUniformLocation, gl.FALSE, modelMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0)
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	

		gl.drawElements(gl.TRIANGLES,boxIndices.length, gl.UNSIGNED_SHORT,0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);


};






















