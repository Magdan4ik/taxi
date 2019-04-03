// 'use strict';

document.addEventListener("DOMContentLoaded", allScripts(window, document));


function allScripts(w, d) {

	/* SVG Drawing */
	const lines = d.querySelectorAll('.drawed');

	function getLines() {
		lines.forEach( el => drawLines(el));
	};

  	function drawLines(line){
		let pathLength   = line.getTotalLength(),
			maxScrollTop = d.body.clientHeight - w.innerHeight,
			percentDone  = Math.max(w.pageYOffset, d.documentElement.scrollTop, d.body.scrollTop) / maxScrollTop,
			length       = percentDone * pathLength;
			line.style.strokeDasharray = [ length ,pathLength].join(' ');
	}
	/* SVG Drawing */

	
	/* Burger Menu*/
	(function mobMenu() {
		let body    = d.body,
			burger  = d.querySelector('.header__burger'),
			nav     = d.querySelector('.header__nav'),
			overlay = d.createElement('div');

			overlay.className='overlay';

			function toggleMobmenu() {
				burger.classList.toggle('active');
				nav.classList.toggle('active');
				body.classList.toggle('hidden');
				(nav.classList.contains('active')) ? body.insertBefore(overlay, body.firstChild) : overlay.remove()
			}

			overlay.addEventListener("click", toggleMobmenu);
			burger.addEventListener("click", toggleMobmenu);
	}());
	/* Burger Menu*/


	/* Zoom */
	function viewPort() {
		const   vp = d.querySelector('meta[name=viewport]'),
				sw = screen.width,
				min = 769,
				max = 1550,
				sc = (sw  / max).toFixed(2),
				range = (sw >= min && sw <= max);

		if ("ontouchstart" in d.documentElement) {
			(range) ? vp.setAttribute('content', 'width='+ max +', initial-scale='+ sc + ', maximum-scale='+ sc + '')
				    : vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1')
		} else {
			if("zoom" in d.body.style) {
				(range) ? d.body.style.zoom = sc : d.body.style.zoom = 1
			} else {
				d.body.classList.add('no-zoom');
			}
		}
	};
	viewPort();
	/* Zoom */


	w.addEventListener('resize', viewPort);
	w.addEventListener('scroll', getLines);

};
