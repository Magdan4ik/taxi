// 'use strict';

let locPhones = {};

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


	/* Order Form */
	const form = d.getElementById("order-form");

	if(form) {
		const inputs = {
			adresses : d.querySelectorAll('input[data-type="adress"]'),
			tel      :  {
				input   : d.querySelector('input[name="to-tel"]'),
				options : {
					mask: '{38}0000000000'
				}
			},
			from : d.querySelector('input[name="from-adress"]'),
			to   : d.querySelector('input[name="to-adress"]'),
			name : d.querySelector('input[name="to-name"]')
		}
		const formComplete = {
			tel: false
		}
		const telMask = new IMask(inputs.tel.input, inputs.tel.options);
			  telMask
				.on('accept', () =>  formComplete.tel = false)
				.on('complete', () => formComplete.tel = true);

		inputs.adresses.forEach(input => {
			new autoComplete({
				selector: input,
				minChars: 5,
				delay: 700,
				// offsetLeft: -61,
				offsetTop: -4,
				source: function(term, response) {
					fetch(`http://cors-anywhere.herokuapp.com/http://credit.oscorp.pro/api.php?address=${term}`, {
						method: "GET"
					})
					.then(res => res.text())
					.then(res => JSON.parse(res))
					.then(res => {
						let addr = [];
						if(res.features) {
							for( let k in res.features) {
								addr.push(`${res.features[k].properties.street}, ${res.features[k].properties.name}`)
							}
						} else if (res.properties) {
							addr.push(`${res.properties.street}, ${res.properties.name}`)
						}
						response(addr);
					})
					.catch(err => console.error('Error:', err));
				}
			});
		});

		form.addEventListener('submit', e => {
			e.preventDefault();
			makeOrder(inputs, formComplete);
		});
	}

	w.addEventListener('resize', viewPort);
	w.addEventListener('scroll', getLines);

};



function makeOrder(inputs, complete) {
	let popup = document.getElementById('popOrder');
	let phone = inputs.tel.input.value;
	let code  = confirmedNumber(phone);
	if(complete.tel) {
		if(!popup) { /* Create popup if not exist */
			let ppup = document.createElement('div');
				ppup.id = 'popOrder';
				ppup.className = 'popup-box';
				document.body.appendChild(ppup);
				ppup.innerHTML += `
					<div class="popup-box__content">
						<div class="popup-box__close"></div>
						<div class="popup-box__body">JS inserting</div>
					</div>`;
				popup = ppup;
		}
		popup.dataset.visible = true; /* Open popup */
		let popBody = popup.querySelector('.popup-box__body');
		if(code) {
			searhTaxi(popBody, code, phone);
		} else {
			сonfirmNumber(popBody, phone);
		}

	} else {
		return inputs.tel.input.focus(); /* Focus tel input if not complete */
	}
	popups();
}



function acceptSMS(btn, phone) {
	const sms = document.getElementById('i-sms');
	let   smsValue = sms.value.trim();
	let   popBody  =  document.querySelector('#popOrder .popup-box__body');

	fetch(`http://cors-anywhere.herokuapp.com/http://credit.oscorp.pro/api.php?register_phone=${phone}&check_code=${smsValue}`, {
		method: "GET"
	})
	.then(res => res.json())
	.then(res =>  {
		if(res.check_code.status == 1) {
			savePhones(phone, smsValue);
			searhTaxi(popBody, smsValue, phone);
		} else {
			alert('Неверный код');
		}
	})
	.catch(err => alert('Ошибка запроса. Попробуйте позже!'));
};


function savePhones(phone, code) {
	locPhones[phone] = code;
	localStorage.setItem("phones", JSON.stringify(locPhones));
};


function confirmedNumber(phone) {
	if(localStorage.phones) {
		let phones = JSON.parse(localStorage.phones);
		for(let k in phones) {
			if(k == phone) return phones[k]; //возвращаем код если есть номер в loc.storage
		}
	};
	return false;
};


function searhTaxi(popBody, code, phone) {
	popBody.innerHTML = `
	<div class="popup-box__title">Поиск авто</div>
		<div class="popup-box__timer">
		<div class="countdown">
			<div class="countdown__number" id="countdown-number"></div>
				<svg>
					<circle r="65" cx="70" cy="70"></circle>
				</svg>
			</div>
		</div>
	`;
	searchTimer(popBody, code, phone);
};

function searchTimer(popBody, code, phone) {
	console.log(code);
	console.log(phone);
	let time = 60;
	let cdNum = document.getElementById('countdown-number');
	let circle = document.querySelector('.countdown circle');
	cdNum.textContent = time;
	let interval = setInterval(() => {
		time = --time;
		cdNum.textContent = time;
		if(time <= 0) {
			clearInterval(interval);
			circle.style.webkitAnimationPlayState = 'paused';
			notFoundTaxi(popBody);
		}
	}, 1000);

	fetch(`http://cors-anywhere.herokuapp.com/http://credit.oscorp.pro/api.php?order=${order}&check_code=${code}&register_phone=${phone}`, {
		method: "GET"
	})
	.then(res => res.text())
	.then(html => {
		if(html) { // Если найдено такси (поменять условие)
			foundTaxi(popBody, html); //передаем html найденного такси
		} else {
			notFoundTaxi(popBody)
		}
	})
	.catch(err => alert('Ошибка отправки смс. Попробуйте позже!'));
};


function сonfirmNumber(popBody, phone) {
	popBody.innerHTML = `
		<div class="popup-box__title">Подтвердите номер телефона</div>
			<div class="popup-box__code">
				<p>Введите код з <b>SMS</b></p>
				<input type="tel" id="i-sms">
			</div>
			<div class="popup-box__actions">
				<button type="button" class="btn popup-box__btn-cancel" onclick="document.querySelector('#popOrder').dataset.visible = false;"><span>Отменить</span></button>
				<button type="button" class="btn btn--primary popup-box__btn-accept" onclick="acceptSMS(this, ${phone})"><span>Подтвердить</span></button>
			</div>
		`;
	fetch(`http://cors-anywhere.herokuapp.com/http://credit.oscorp.pro/api.php?register_phone=${phone}`, {
		method: "GET"
	})
	.catch(err => alert('Ошибка отправки смс. Попробуйте позже!'));
};

function notFoundTaxi(popBody) {
	popBody.innerHTML = `
	<div class="popup-box__title">Авто не найдено</div>
		<div class="popup-box__notfound">
			<div class="popup-box__notfound-img"><img src="/img/car-notfound.svg"></div>
			<button class="popup-box__notfound-later" type="button" onclick="document.querySelector('#popOrder').dataset.visible = false;">Попробовать немного позже</button>
		</div>
	`;
};

function foundTaxi(popBody, html) {
	popBody.innerHTML = `
	<div class="popup-box__title">Ваш автомобиль</div>
		<div class="popup-box__found">
			<div class="popup-box__found-txt">
				${html}
			</div>
			<button class="btn btn--primary" type="button" onclick="document.querySelector('#popOrder').dataset.visible = false;">Ок</button>
		</div>
	`;
};


function popups() {
	document.querySelectorAll('.open-popup').forEach(el => {
		el.addEventListener('click', () => {
		  document.querySelector(el.dataset.modal).dataset.visible = true;
		});
	  });
	document.querySelectorAll('.popup-box').forEach(el => {
		el.addEventListener('click', e => {
			if(e.target.classList.contains("popup-box") || e.target.classList.contains("popup-box__close")) {
				el.dataset.visible = false;
			}
		});
	});
};
popups();