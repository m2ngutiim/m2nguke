"use strict";		//for debugging and checking, if variables are correctly defined
var can, gl, ac,
	cam = {qlt: 0.9, pos: [0, 0], zom: 1, cor: m3id(), pro: m3id(), mat: m3id()},
	map = [], sce = [], rng = rnumgen(), pro = [];

window.onresize = function() {
	var h = window.innerHeight,
		w = window.innerWidth,
		qh = h * cam.qlt,
		qw = w * cam.qlt;
	can.height = qh;
	can.width = qw;
	gl.viewport(0, 0, qw, qh);
	m3pro2d(cam.pro, w, h);
	m3sandt(cam.mat, cam.pro, cam.zom, cam.pos);
	m3copy(cam.cor, cam.pro);
	cam.cor[6] = -1;
	cam.cor[7] = 1;
};

window.onload = function() {
	can = document.getElementById('can');
	gl = can.getContext('webgl') || can.getContext('webgl-experimental');
	ac = window.webkitAudioContext ? new window.webkitAudioContext() : window.AudioContext ? new window.AudioContext() : 0;
	if (!ac) {console.log('No AudioContext support.'); return}
	if (!gl) {console.log('No webGL support.'); return}
	
	window.onresize();
	gl.clearColor(0, 0, 0, 1);
	gl.clearDepth(1);
	//gl.enable(gl.DEPTH_TEST);
	//gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	var p = gl.createProgram();
	addshader(p, document.getElementById('vs').textContent, gl.VERTEX_SHADER);
	addshader(p, document.getElementById('fs').textContent, gl.FRAGMENT_SHADER);
	gl.linkProgram(p);
	p.apos = gl.getAttribLocation(p, 'apos');
	p.atex = gl.getAttribLocation(p, 'atex');
	p.usam = gl.getUniformLocation(p, 'usam');
	p.ucam = gl.getUniformLocation(p, 'ucam');
	p.uobj = gl.getUniformLocation(p, 'uobj');
	
	p.tex = createSolidTexture(255, 255, 255, 255);
	pro.push(p);
	sce.push(mesh(100));
	
	loop();
};


window.oncontextmenu = function() {return false};
	
function loop() {
	requestAnimationFrame(loop, can);
	if (document.hasFocus()) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var i = sce.length;
		while ( --i >= 0) {
			sce[i].render();
		}
	}
}
