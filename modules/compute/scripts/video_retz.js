

if(typeof e4called === "undefined"){
	e4called = true;
	
	let las = loadLASProgressive("D:/dev/pointclouds/Riegl/Retz_Airborne_Terrestrial_Combined_1cm.las");

	let pc = new PointCloudProgressive("testcloud", "blabla");
	pc.boundingBox.min.set(...las.boundingBox.min);
	pc.boundingBox.max.set(...las.boundingBox.max);

	log(pc.boundingBox);

	let handles = las.handles;

	let attributes = [
		new GLBufferAttribute("position", 0, 3, gl.FLOAT, gl.FALSE, 12, 0),
		//new GLBufferAttribute("color",    1, 4, gl.UNSIGNED_BYTE, gl.TRUE, 4, 12),
		new GLBufferAttribute("value", 1, 4, gl.INT, gl.FALSE, 4, 12, {targetType: "int"}),
	];

	let bytesPerPoint = attributes.reduce( (p, c) => p + c.bytes, 0);

	let maxPointsPerBuffer = 134 * 1000 * 1000;
	let numPointsLeft = las.numPoints;

	let glBuffers = handles.map( (handle) => {

		let numPointsInBuffer = numPointsLeft > maxPointsPerBuffer ? maxPointsPerBuffer : numPointsLeft;
		numPointsLeft -= maxPointsPerBuffer;

		let glbuffer = new GLBuffer();

		glbuffer.attributes = attributes;

		gl.bindVertexArray(glbuffer.vao);
		glbuffer.vbo = handle;
		gl.bindBuffer(gl.ARRAY_BUFFER, glbuffer.vbo);

		for(let attribute of attributes){

			let {location, count, type, normalize, offset} = attribute;

			gl.enableVertexAttribArray(location);

			if(attribute.targetType === "int"){
				gl.vertexAttribIPointer(location, count, type, bytesPerPoint, offset);
			}else{
				gl.vertexAttribPointer(location, count, type, normalize, bytesPerPoint, offset);
			}
		}

		gl.bindVertexArray(0);

		glbuffer.count =  numPointsInBuffer;

		return glbuffer;
	});

	pc.glBuffers = glBuffers;

	let s = 0.3;
	pc.transform.elements.set([
		s, 0, 0, 0, 
		0, 0, -s, 0, 
		0, s, 0, 0, 
		-10, 1.4, -11, 1, 
	]);

	scene.root.add(pc);

	pc.numPoints = las.numPoints;

	// listeners.update.push(() => {

	// 	if(pc.numPoints !== las.numPoints){
	// 		//log(las.numPoints);
	// 	}
	// 	pc.numPoints = las.numPoints;
		
	// });

}

window.width = 1920;
window.height = 1080;
window.x = 0;
window.y = 0;

view.set(
	[169.787, 25.107, -260.786], 
	[161.625, 16.001, -269.848]
);

camera.fov = 80;



listeners.update = [() => {
	
	const r = 15;

	const t = now();
	const x = Math.cos(1 * t) * r;
	const y = Math.sin(1 * t) * r;

	const target = [161.625, 16.001, -269.848];

	view.set(
		[target[0] + x, target[1] + 10, target[2] + y], 
		[...target]
	);

	const method = parseInt((1.0 * t / (2 * Math.PI)) % 3);

	if(method === 0){
		renderDebug = renderPointCloudBasic;
	}else if(method === 1){
		renderDebug = renderPointCloudCompute;
	}else{
		renderDebug = renderComputeHQS;
	}

	while(GLTimerQueries.history.length > 30){
		GLTimerQueries.history.shift();
	}

}];


