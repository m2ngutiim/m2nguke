"use strict";
/**
 * Sends an XMLHttpRequest to a url and returns the response
 * to the callback function once it arrives
 *
 * @param {string} target url
 * @param {function} callback function
 * @param {string} response type
 * @returns {object} XMLHttpRequest object
 */
function xhr(u, c, t) {
	var r = new XMLHttpRequest();
	r.onreadystatechange = function() {
		if (r.readyState == 4 && r.status == 200) {
			c(r.response);
		}
	};
	r.open("GET", u, true);
	if (t) {r.responseType = t;}
	r.send();
	return r;
}
/**
 * Decompresses an LZW encoded string into the original
 *
 * @param {string} compressed string
 * @returns {string} original string
 */
function decomp(s) {
	var a = {},
	b = s.split(""),
	c = b[0],
	d = c,
	e = [c],
	f = 256,
	g,
	h,
	i;
	for (i = 1; i < b.length; i++) {
		h = b[i].charCodeAt(0);
		if(h < 256){
			g = b[i];
		}else{
			g = a[h] ? a[h] : (d + c);
		}
		e.push(g);
		c = g.charAt(0);
		a[f] = d + c;
		f++;
		d = g;
	}
	return e.join("");
}
/**
 * Compresses a string with the LZW encoding
 *
 * @param {string} target string
 * @returns {string} compressed string
 */
function comp(s) {
	var d = [],
	a = s.split(""),
	o = [],
	c,
	p = a[0],
	k = 256,
	i;
	for (i = 1; i < a.length; i++) {
		c = a[i];
		if (d.hasOwnProperty(p + c)) {
			p += c;
		} else {
			o.push(p.length > 1 ? d[p] : p.charCodeAt(0));
			d[p + c] = k;
			k ++;
			p = c;
		}
	}
	o.push(p.length > 1 ? d[p] : p.charCodeAt(0));
	for (i = 0; i < o.length; i++) {
		o[i] = String.fromCharCode(o[i]);
	}
	return o.join("");
}
/**
 * Returns the excecution times of 2 functions
 *
 * @param {function} first function
 * @param {function} second function
 * @param {integer} repeats
 * @returns {array} 2 times in milliseconds
 */
function exetime(a, b, r) {
	var t0, t1, t2, x, i;
	t0 = Date.now();
	i = r;
	while (--i >= 0) {
		x = a();
	}
	t1 = Date.now();
	i = r;
	while (--i >= 0) {
		x = b();
	}
	t2 = Date.now();
	return [t1 - t0, t2 - t1];
}
/**
 * A seedable random number generator
 * ~ 5 times slower than Math.random()
 *
 * @param {integer} seed
 * @returns {object} the rng object
 */
function rnumgen(s) {
	var i = 2147483647, s = s || Math.random();
	return {
		set: function(a) {
			s = a;
		},
		get: function() {
			s = s * 16807 % i;
			return s / i;
		}
	}
}
/**
 * Makes sure requestAnimationFrame could be used
 *
 * @returns {boolean} if native support is available
 */
function animfix() {
	var x, b = ['ms', 'moz', 'webkit', 'o'], then = Date.now(), now, call;
	for (x = 0; x < b.length && !window.requestAnimationFrame; x++) {
		window.requestAnimationFrame = window[b[x] + 'RequestAnimationFrame'];
		window.cancelRequestAnimationFrame = window[b[x] + 'CancelRequestAnimationFrame'];
	}
	if (!requestAnimationFrame) {
		requestAnimationFrame = function(c, e) {
			now = Date.now();
			call = Math.max(0, 16 - now + then);
			setTimeout(c(now + call), call);
			then = now + call;
		}
		return false;
	}
	return true;
}
/**
 * 4D Simplex noise generator 
 *
 * @param {object} random number generator(opt)
 * @param {integer} octaves (nr of noise layers / quality)
 * @param {float} persistence
 * @returns {object} the noise object (get {function}, set {function})
 */
function simp4(r, o, p) {
	var F4 = (Math.sqrt(5) - 1) / 4,
	G4 = (5 - Math.sqrt(5)) / 20,
	G42 = G4 * 2,
	G43 = G4 * 3,
	G44 = G4 * 4 - 1,
	grad4 = [[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],
		[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],
		[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],
		[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],
		[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],
		[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],
		[-1,-1,1,0],[-1,-1,-1,0]],// Gradient vectors for 4D
	aPerm = [],// Permutation table
	// A lookup table to traverse the simplex around a given point in 4D.
	simplex = [[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],
		[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],
		[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],
		[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
		[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],
		[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],
		[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],
		[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
		[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],
		[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],
		[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]],
	iOctaves = o || 1, fPersistence = p || 0.5,
	fResult, fFreq, fPers, rng = r || Math,
	aOctFreq,// frequency per octave
	aOctPers,// persistence per octave
	fPersMax,// 1 / max persistence
	octFreqPers = function() {
		aOctFreq = [];
		aOctPers = [];
		fPersMax = 0;
		for (var i = 0; i < iOctaves; i++) {
			fFreq = Math.pow(2, i);
			fPers = Math.pow(fPersistence, i);
			fPersMax += fPers;
			aOctFreq.push(fFreq);
			aOctPers.push(fPers);
		}
		fPersMax = 1 / fPersMax;
	},
	dot4 = function(g, x, y, z, w) {
		return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
	},
	noise4d = function(x, y, z, w) {
		// from the five corners
		// Skew the (x,y,z,w) space to determine which cell of 24 simplices
		var s = (x + y + z + w) * F4,// Factor for 4D skewing
			i = Math.floor(x + s), j = Math.floor(y + s),
			k = Math.floor(z + s), l = Math.floor(w + s),
			t = (i + j + k + l) * G4,// Factor for 4D unskewing
			x0 = x - (i - t), y0 = y - (j - t),// The x,y,z,w distances from the cell origin
			z0 = z - (k - t), w0 = w - (l - t), c = 0;
			// For the 4D case, the simplex is a 4D shape I won't even try to describe.
			// To find out which of the 24 possible simplices we're in, we need to determine the magnitude ordering of x0, y0, z0 and w0.
			// The method below is a good way of finding the ordering of x,y,z,w and then find the correct traversal order for the simplex were in.
			// First, six pair-wise comparisons are performed between each possible pair of the four coordinates, and the results are used to add up binary bits for an integer index.
		if (x0 > y0) {c = 0x20;}
		if (x0 > z0) {c |= 0x10;}
		if (y0 > z0) {c |= 0x08;}
		if (x0 > w0) {c |= 0x04;}
		if (y0 > w0) {c |= 0x02;}
		if (z0 > w0) {c |= 0x01;}
		// simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some
			// order. Many values of c will never occur, since e.g. x>y>z>w makes
			// x<z, y<w and x<w impossible. Only the 24 indices which have non-zero
			// entries make any sense. We use a thresholding to set the coordinates
			// in turn from the largest magnitude. The number 3 in the "simplex"
			// array is at the position of the largest coordinate.
		var sc = simplex[c],
			i1 = sc[0] >= 3 ? 1 : 0, j1 = sc[1] >= 3 ? 1 : 0,
			k1 = sc[2] >= 3 ? 1 : 0, l1 = sc[3] >= 3 ? 1 : 0,
			i2 = sc[0] >= 2 ? 1 : 0, j2 = sc[1] >= 2 ? 1 : 0,// The number 2 in the "simplex" array is at the second largest coordinate.
			k2 = sc[2] >= 2 ? 1 : 0, l2 = sc[3] >= 2 ? 1 : 0,
			i3 = sc[0] >= 1 ? 1 : 0, j3 = sc[1] >= 1 ? 1 : 0,//The number 1 in the "simplex" array is at the second smallest coordinate.
			k3 = sc[2] >= 1 ? 1 : 0, l3 = sc[3] >= 1 ? 1 : 0,
			// The fifth corner has all coordinate offsets = 1, so no need to look
			// that up.
			x1 = x0 - i1 + G4, y1 = y0 - j1 + G4,// Offsets for second corner in (x,y,z,w)
			z1 = z0 - k1 + G4, w1 = w0 - l1 + G4,
			x2 = x0 - i2 + G42, y2 = y0 - j2 + G42,// Offsets for third corner in (x,y,z,w)
			z2 = z0 - k2 + G42, w2 = w0 - l2 + G42,
			x3 = x0 - i3 + G43, y3 = y0 - j3 + G43,// Offsets for fourth corner in (x,y,z,w)
			z3 = z0 - k3 + G43, w3 = w0 - l3 + G43,
			x4 = x0 + G44, y4 = y0 + G44,// Offsets for last corner in (x,y,z,w)
			z4 = z0 + G44, w4 = w0 + G44,
			ii = i & 255, jj = j & 255,// Work out the hashed gradient indices of the five simplex corners
			kk = k & 255, ll = l & 255,
			n0, n1, n2, n3, n4,
			gi0, gi1, gi2, gi3, gi4,
			// Calculate the contribution from the five corners
		t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0,
		t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1,
		t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2,
		t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3,
		t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
		if (t0 < 0) {n0 = 0} else {
			t0 *= t0;
			gi0 = aPerm[ii + aPerm[jj + aPerm[kk + aPerm[ll]]]]%32;
			n0 = t0 * t0 * dot4(grad4[gi0], x0, y0, z0, w0);
		}
		if (t1<0) {n1 = 0} else {
			t1 *= t1;
			gi1 = aPerm[ii + i1 + aPerm[jj + j1 + aPerm[kk + k1 + aPerm[ll + l1]]]] % 32;
			n1 = t1 * t1 * dot4(grad4[gi1], x1, y1, z1, w1);
		}
		if (t2<0) {n2 = 0} else {
			t2 *= t2;
			gi2 = aPerm[ii + i2 + aPerm[jj + j2 + aPerm[kk + k2 + aPerm[ll + l2]]]] % 32;
			n2 = t2 * t2 * dot4(grad4[gi2], x2, y2, z2, w2);
		}
		if (t3<0) {n3 = 0} else {
			t3 *= t3;
			gi3 = aPerm[ii + i3 + aPerm[jj + j3 + aPerm[kk + k3 + aPerm[ll + l3]]]] % 32;
			n3 = t3 * t3 * dot4(grad4[gi3], x3, y3, z3, w3);
		}
		if (t4<0) {n4 = 0} else {
			t4 *= t4;
			gi4 = aPerm[ii + 1 + aPerm[jj + 1 + aPerm[kk + 1 + aPerm[ll + 1]]]] % 32;
			n4 = t4 * t4 * dot4(grad4[gi4], x4, y4, z4, w4);
		}
		return 27.0 * (n0 + n1 + n2 + n3 + n4);// Sum up and scale the result to cover the range [-1,1]
	},
	p = [];
	for (i = 0; i < 256; i++) {
		p[i] = Math.floor(rng.random() * 256);
	}
	for(i = 0; i < 512; i++) {
		aPerm[i] = p[i & 255];
	}
	octFreqPers();
	return {
		get: function(x, y, z, w) {
			var fResult = 0, g = 0;
			for (; g < iOctaves; g++) {
				fFreq = aOctFreq[g];
				fPers = aOctPers[g];
				fResult += fPers * noise4d(fFreq * x, fFreq * y, fFreq * z, fFreq * w);
			}
			return ( fResult * fPersMax + 1 ) * 0.5;
		},
		set: function(octaves, falloff) {
			iOctaves = octaves || iOctaves;
			fPersistence = falloff || fPersistence;
			octFreqPers();
		}
	};
}
/**
 * 3D Simplex noise generator 
 *
 * @param {object} random number generator(opt)
 * @param {integer} octaves (nr of noise layers / quality)
 * @param {float} persistence
 * @returns {object} the noise object (get {function}, set {function})
 */
function simp3(r, o, p) {
	var F3 = 1 / 3, G3 = 1/6,
	aPerm = [],// Permutation table
	aGrad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],
	[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],
	[0,-1,1],[0,1,-1],[0,-1,-1]],// Gradient vectors for 3D
	iOctaves = 1, fPersistence = 0.5,
	fResult, fFreq, fPers,
	aOctFreq,// frequency per octave
	aOctPers,// persistence per octave
	fPersMax,// 1 / max persistence
	dot3 = function(g, x, y, z) {
		return g[0]*x + g[1]*y + g[2]*z;
	},
	octFreqPers = function() {
		aOctFreq = [];
		aOctPers = [];
		fPersMax = 0;
		for (var i = 0; i < iOctaves; i++) {
			fFreq = Math.pow(2, i);
			fPers = Math.pow(fPersistence, i);
			fPersMax += fPers;
			aOctFreq.push(fFreq);
			aOctPers.push(fPers);
		}
		fPersMax = 1 / fPersMax;
	},
	noise3d = function(x, y, z) {
			// Noise contributions from the four corners 
			// Skew the input space to determine which simplex cell we're in 
			var s = (x + y + z) * F3, // Very nice and simple skew factor for 3D 
			i = Math.floor(x + s),
			j = Math.floor(y + s),
			k = Math.floor(z + s),
			t = (i + j + k) * G3,
			x0 = x - (i - t), // Unskew the cell origin back to (x,y,z) space 
			y0 = y - (j - t), // The x,y,z distances from the cell origin 
			z0 = z - (k - t);
			// For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
			// Determine which simplex we are in. 
			// Offsets for second corner of simplex in (i,j,k) coords 
			// Offsets for third corner of simplex in (i,j,k) coords 
			if (x0 >= y0) {
				if (y0>=z0) { // X Y Z order
					j1 = k1 = k2 = 0;
					i1 = i2 = j2 = 1;
				} else if (x0>=z0) { // X Z Y order
					j1 = k1 = j2 = 0;
					i2 = k2 = i1 = 1;
				} else { // Z X Y order
					i1 = j1 = j2 = 0;
					k2 = k1 = i2 = 1;
				} 
			} else { // x0<y0 
				if (y0<z0) { // Z Y X order
					i1 = j1 = i2 = 0;
					j2 = k2 = k1 = 1;
				} else if (x0<z0) { // Y Z X order
					i1 = k1 = i2 = 0;
					j2 = k2 = j1 = 1;
				} else { // Y X Z order
					i1 = k1 = k2 = 0;
					i2 = j2 = j1 = 1;
				}
			} 
			// A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
			// a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
			// a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
			// c = 1/6.
			x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
			y1 = y0 - j1 + G3; 
			z1 = z0 - k1 + G3; 
			x2 = x0 - i2 + F3; // Offsets for third corner in (x,y,z) coords 
			y2 = y0 - j2 + F3; 
			z2 = z0 - k2 + F3; 
			x3 = x0 - 0.5; // Offsets for last corner in (x,y,z) coords 
			y3 = y0 - 0.5; 
			z3 = z0 - 0.5; 
			// Work out the hashed gradient indices of the four simplex corners 
			ii = i&255; 
			jj = j&255; 
			kk = k&255; 
			// Calculate the contribution from the four corners 
			t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
			if (t0<0) {
				n0 = 0; 
			} else { 
				t0 *= t0; 
				gi0 = aPerm[ii+aPerm[jj+aPerm[kk]]] % 12; 
				n0 = t0 * t0 * dot3(aGrad3[gi0], x0, y0, z0); 
			}
			t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
			if (t1<0) {
				n1 = 0; 
			} else { 
				t1 *= t1; 
				gi1 = aPerm[ii+i1+aPerm[jj+j1+aPerm[kk+k1]]] % 12; 
				n1 = t1 * t1 * dot3(aGrad3[gi1], x1, y1, z1); 
			} 
			t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
			if (t2<0) {
				n2 = 0; 
			} else { 
				t2 *= t2; 
				gi2 = aPerm[ii+i2+aPerm[jj+j2+aPerm[kk+k2]]] % 12; 
				n2 = t2 * t2 * dot3(aGrad3[gi2], x2, y2, z2); 
			} 
			t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
			if (t3<0) {
				n3 = 0; 
			} else { 
				t3 *= t3; 
				gi3 = aPerm[ii+1+aPerm[jj+1+aPerm[kk+1]]] % 12; 
				n3 = t3 * t3 * dot3(aGrad3[gi3], x3, y3, z3); 
			} 
			// Add contributions from each corner to get the final noise value. 
			// The result is scaled to stay just inside [0,1] 
			return 32 * (n0 + n1 + n2 + n3);
		};
	p = [];
	for (i = 0; i < 256; i++) {
		p[i] = Math.floor(Math.random() * 256);
	}
	for(i = 0; i < 512; i++) {
		aPerm[i] = p[i & 255];
	}
	octFreqPers();
	return {
		get: function(x, y, z) {
			var fResult = 0, g = 0;
			for (; g < iOctaves; g++) {
				fFreq = aOctFreq[g];
				fPers = aOctPers[g];
				fResult += fPers * noise3d(fFreq * x, fFreq * y, fFreq * z);
			}
			return ( fResult * fPersMax + 1 ) * 0.5;
		},
		set: function(octaves, falloff) {
			iOctaves = octaves || iOctaves;
			fPersistence = falloff || fPersistence;
			octFreqPers();
		}
	};
};
/**
 * A plane parallel to x-z plane
 *
 * @param {float} 1/2 width along x axis
 * @param {float} 1/2 length along z axis
 * @param {object} object receiving geometry
 * @returns {object} object with geometry
 */
function plane(x, z, o) {
	o = o || {};
	o.v = [-x, 0, -z, x, 0, -z, -x, 0, z, x, 0, z];
	o.i = [0, 1, 2, 1, 3, 2];
	o.n = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
	o.t = [0, 0, 1, 0, 0, 1, 1, 1];
	return o;
}
/**
 * Cuboid geometry
 *
 * @param {float} 1/2 width along x axis
 * @param {float} 1/2 height along y axis
 * @param {float} 1/2 length along z axis
 * @param {object} object receiving geometry
 * @returns {object} object with geometry
 */
function cuboid(x, y, z, o) {
	var t = 0.57735;
	o = o || {};
	o.v = [x, y, z, x, -y, z, -x, -y, z, -x, y, z, x, y, -z, x, -y, -z,
		-x, -y, -z, -x, y, -z];
	o.i = [2, 1, 0, 0, 3, 2, 1, 5, 4, 4, 0, 1, 5, 6, 7, 7, 4, 5, 6, 2, 3,
		3, 7, 6, 6, 5, 1, 1, 2, 6, 3, 0, 4, 4, 7, 3];
	o.n = [t, t, t, t, -t, t, -t, -t, t, -t, t, t, t, t, -t, t, -t, -t,
		-t, -t, -t, -t, t, -t];
	return o;
}
/**
 * Icosahedron geometry
 *
 * @param {float} ~1/2 radius of circumscribed sphere
 * @param {object} object receiving geometry
 * @returns {object} object with geometry
 */
function icosa(a, o) {
	var t = (1 + Math.sqrt(5)) * 0.5 * a;
	o = o || {};
	o.v = [a, t, 0, -a, t, 0, a, -t, 0, -a, -t, 0, 0, a, t, 0, -a, t, 0, a, -t, 0, -a, -t, t, 0, a, -t, 0, a, t, 0, -a, -t, 0, -a];
	o.i =[0, 4, 1, 0, 1, 6, 0, 6, 10, 0, 10, 8, 0, 8, 4, 3, 9, 5, 3, 5, 2,
		3, 2, 7, 3, 7, 11, 3, 11, 9, 8, 5, 4, 4, 5, 9, 9, 1, 4, 1, 9, 11,
		1, 11, 6, 11, 7, 6, 6, 7, 10, 10, 7, 2, 10, 2, 8, 2, 5, 8];
}
/**
 * Tetrahedron geometry
 *
 * @param {float} ~1/2 radius of circumscribed sphere
 * @param {object} object receiving geometry
 * @returns {object} object with geometry
 */
function tetra(a, o) {
	a *= 0.57735;
	o = o || {};
	o.v = [a, a, a, a, -a, -a, -a, a, -a, -a, -a, a],
	o.i = [0, 2, 1, 1, 3, 0, 0, 3, 2, 2, 3, 1];
	return o;
}
/**
 * Adds a shader to a webgl program
 *
 * @param {WebGL Program} the receiving program
 * @param {string} shader source code
 * @param {string} type of the shader
 * @returns {WebGL Shader} the shader object
 */
function addshader(p, s, t) {
	var o = gl.createShader(t);
	gl.shaderSource(o, s);
	gl.compileShader(o);
	gl.attachShader(p, o);
	return o;
}
/**
 * creates a static draw webgl buffer
 *
 * @param {integer} the webgl buffer type
 * @param {array} the data to store in the buffer
 * @returns {WebGL Buffer} the buffer object
 */
function glbuf(type, data) {
	var b = gl.createBuffer();
	gl.bindBuffer(type, b);
	gl.bufferData(type, data, gl.STATIC_DRAW);
	return b
}
/**
 * applies a 2d orthogonal projection to a 3x3 matrix
 *
 * @param {Float32Array} destination array
 * @param {integer} width of a screen
 * @param {integer} height of a screen
 */
function m3pro2d(o, w, h) {
	o[0] = 2 / w; o[4] = -2 / h;
}
/**
 * applies rotation and translation to a 3x3 matrix
 *
 * @param {Float32Array} the receiving matrix
 * @param {Float32Array} angle in radians
  * @param {Float32Array} displacement vector
 */
function m3randt(o, r, v) {
	var s = Math.sin(r), c = Math.cos(r), x = v[0], y = v[1];
	o[0] = o[4] = c; o[1] = s; o[3] = -s;
	o[6] = x; o[7] = y;
}
/**
 * creates a 3x3 identity matrix
 *
 * @returns {Float32Array} 3x3 identity matrix
 */
function m3id() {
	var o = new Float32Array(9);
	o[0] = o[4] = o[8] = 1;
	o[1] = o[2] = o[3] = o[5] = o[6] = o[7] = 0;
	return o;
}
/**
 * scales and translates a 3x3 matrix
 *
 * @param {Float32Array} receiving matrix
 * @param {Float32Array} input matrix
 * @param {Integer} scaling value
 * @param {Array} displacement vector
 */
function m3sandt(o, i, z, v) {
	o[6] = v[0] * z; o[7] = v[1] * z;
	o[0] = i[0] * z;
	o[1] = i[1] * z;
	o[3] = i[3] * z;
	o[4] = i[4] * z;
}

function m3copy(o, i) {
	o[0] = i[0]; o[1] = i[1]; o[2] = i[2];
	o[3] = i[3]; o[4] = i[4]; o[5] = i[5];
	o[6] = i[6]; o[7] = i[7]; o[8] = i[8];
}

function createSolidTexture(r, g, b, a) {
    var data = new Uint8Array([r, g, b, a]);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	//gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

function mesh(w) {
	var o = {
		ver: [-w, -w, w, -w, w, w, -w, w],
		ind: [0, 1, 2, 2, 3, 0],
		txc: [0, 0, 1, 0, 1, 1, 0, 1],
		ang: 0,
		rot: (0.5 - rng.get()) * 0.01,
		pos: [100 - 200 * rng.get(), 100 - 200 * rng.get()],
		vel: [0.5 - rng.get(), 0.5 - rng.get()],
		mat: m3id(),
		buf: {},
		sel: 0,
		render: function() {
			o.ang += o.rot;
			o.pos[0] += o.vel[0]; o.pos[1] += o.vel[1];
			m3randt(o.mat, o.ang, o.pos);
			var p = pro[0];
			gl.useProgram(p);
			gl.enableVertexAttribArray(p.apos);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.buf.ib);
			gl.bindBuffer(gl.ARRAY_BUFFER, o.buf.vb);
			gl.vertexAttribPointer(p.apos, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(p.atex);
			gl.bindBuffer(gl.ARRAY_BUFFER, o.buf.tb);
			gl.vertexAttribPointer(p.atex, 2, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, p.tex);
			gl.uniform1i(p.usam, 0);
			gl.uniformMatrix3fv(p.ucam, false, cam.mat);
			gl.uniformMatrix3fv(p.uobj, false, o.mat);
			gl.drawElements(gl.TRIANGLES, o.ind.length, gl.UNSIGNED_SHORT, 0);
		}};
	o.buf.vb = glbuf(gl.ARRAY_BUFFER, new Float32Array(o.ver));
	o.buf.ib = glbuf(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(o.ind));
	o.buf.tb = glbuf(gl.ARRAY_BUFFER, new Float32Array(o.txc));
	return o;
}
