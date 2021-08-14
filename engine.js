import inicijalizirajDisplay from "./inicijalizirajDisplay.js";

const sirina = 900;
const visina = 600;

const pocetnaVy = -300;   //  pocetna brzina novonastale manje loptice
const visMax1 = 440;
const visMax2 = 370;
const visMax3 = 240;
const visMax4 = 140;

var idGen = idGenerator();

function ispis_sinusoide() {
	for (let i = 0; i <= 200; i += 10) {
		let y = 50 * Math.sin(Math.PI * 2 / 200 * i);
		console.log(i + " : " + y);
	}
}


window.onload = function() {
	//ispis_sinusoide();
	
	inicijalizirajDisplay(visina, sirina, 25);
	
	let poljeLopti = [];
	
	let l = new Lopta({size:1, vx:110, vy:0, hMax:visMax1, x:130, y:100, g:700});
	poljeLopti.push(l);
	l = new Lopta({size:2, vx:-110, vy:40, hMax:visMax2, x:330, y:100, g:700});
	poljeLopti.push(l);
	
	//window.requestAnimationFrame(l.nacrtaj);
	
	let igr = new Igrac({vis: 110, sir: 70, x: 300, brzinaKretanja: 150});
	let oruzje = new Oruzje({sir: 30, brz: 300});
	
	let kontrole = new Kontrole({igracObjekt: igr, oruzjeObjekt: oruzje});
	
	if (false) {
	var idtimer = setInterval(oruzje.nacrtaj, 50);
	setTimeout(()=> {clearTimeout(idtimer)}, 30000);
    }
	
	if (false) {
	var idtimer = setInterval(igr.nacrtaj, 50);
	setTimeout(()=> {clearTimeout(idtimer)}, 30000);
    }
	
	if (false) {
	var idtimer = setInterval(l.nacrtaj, 20);
	setTimeout(()=> {clearTimeout(idtimer)}, 30000);
    }
    
    if (false) {
	var idtimer = setInterval(() => {igr.nacrtaj(); l.nacrtaj()}, 20);
	setTimeout(()=> {clearTimeout(idtimer)}, 30000);
    }
    
    if (true) {
	var idtimer = setInterval(() => {
		igr.nacrtaj(); 
		oruzje.nacrtaj();
		
		for (let i = poljeLopti.length-1; i > -1; i--) {
			let obj = poljeLopti[i];
		    obj.nacrtaj();
		    if (obj.interakcijaOruzje(oruzje)) {
				oruzje.ugasi();
				console.log("pogodak!");	
				poljeLopti.push(...obj.reduciraj());
				poljeLopti.splice(i, 1);
			}
		}
		
	}, 20);
	setTimeout(()=> {clearTimeout(idtimer)}, 30000);
    }
}

class Kontrole {
	constructor({igracObjekt, oruzjeObjekt}) {
		
		this.keyDown = false;
		this.igracObjekt = igracObjekt;
		this.oruzjeObjekt = oruzjeObjekt;
		
		//this.igracObjekt.smjerKretanja = "l";
		//console.log("inicijalizacija kontrola " + this.igracObjekt.smjerKretanja);
		
		document.addEventListener("keydown", (e) => {this.pritisakGumba(e)});
        document.addEventListener("keyup", (e) => {this.pritisakGumbaUp(e)});
                
        this.pritisakGumba = this.pritisakGumba.bind(this);
		this.pritisakGumbaUp = this.pritisakGumbaUp.bind(this);
	}
	
	pritisakGumba(ev) {	
		ev.preventDefault();
		//if (!this.keyDown) {
			switch (ev.code) {
				case ("ArrowLeft"):
				    if (this.keyDown !== "ArrowLeft") {
				        this.keyDown = "ArrowLeft";
				        //console.log("na pritisak je " + this.igracObjekt);
				        this.igracObjekt.smjerKretanja = "l";
				        console.log("Stisnuo si Lijevu strelicu " + Math.random());
				    }
				    break;
				case ("ArrowRight"):
				    if (this.keyDown !== "ArrowRight") {
				        this.keyDown = "ArrowRight";
				        this.igracObjekt.smjerKretanja = "d";
				        console.log("Stisnuo si desnu strelicu " + Math.random());
				    }
				    break;	
			}
		//}
		
		if (ev.code === "KeyS") {
			console.log("stisnuo si gumb S " + Math.random());
			console.log("polozaj pucaljke je " + this.igracObjekt.vratiPolozajPucaljke());
			this.oruzjeObjekt.pucaj(this.igracObjekt.vratiPolozajPucaljke());
		}
		
	}
	
	pritisakGumbaUp(ev) {	
	    switch (ev.code) {
			case ("ArrowLeft"):
			    if (this.keyDown == "ArrowLeft") {
				    this.keyDown = false;
				    this.igracObjekt.smjerKretanja = null;
				    console.log("Otpustio si lijevu strelicu " + Math.random());
			    }
				break;
			case ("ArrowRight"):
			    if (this.keyDown == "ArrowRight") {
				    this.keyDown = false;
				    this.igracObjekt.smjerKretanja = null;
				    console.log("Otpustio si desnu strelicu " + Math.random());
			    }
				break;	
		}
    }
}

class Oruzje {
	constructor({sir, brz, visIgraca=100}) {
		this.sirina = sir;
		this.brzina = brz;
		this.pocetnaVisina = visIgraca;
		
		this.aktivnoSw = false; 
		
		this.time = null;
		this.x = null;
		this.y = null;
		this.el = document.createElement("div");			
		this.id = "oruzje";
		this.el.id = this.id;
		dodajStilove(this.el, {width: this.sirina + "px", height: this.pocetnaVisina + "px", position: "absolute",
			                  bottom: "0px", display: "none", overflow: "hidden", backgroundColor: "white"});
			                  
	    this.slikaOruzja = document.createElement("div");
	    dodajStilove(this.slikaOruzja, {width: "100%", height: visina + "px", backgroundImage: "url('slika_oruzja1.svg')", backgroundRepeat: "no-repeat", backgroundSize: "contain", opacity: "1", position: "absolute", top: "0px", left: "0px"});
		this.el.appendChild(this.slikaOruzja);
		this.slikaOruzja1 = document.createElement("div");
	    dodajStilove(this.slikaOruzja1, {width: "100%", height: visina + "px", backgroundImage: "url('slika_oruzja1a.svg')", backgroundRepeat: "no-repeat", backgroundSize: "contain", opacity: "0", position: "absolute", top: "0px", left: "0px"});
		this.el.appendChild(this.slikaOruzja1);
			                  
	    document.querySelector(".display").appendChild(this.el);
	    
	    this.pucaj = this.pucaj.bind(this);
	    this.nacrtaj = this.nacrtaj.bind(this);
	    this.ugasi = this.ugasi.bind(this);
	}
	
	ugasi() {
		this.aktivnoSw = false;
		dodajStilove(this.el, {height: "0px", display: "none"});
	}
	
	pucaj(x) {
		if (!this.aktivnoSw) {
			this.aktivnoSw = true;
			this.time = performance.now();
			this.x = x;
			this.y = 0;
			dodajStilove(this.el, {left: (this.x - this.sirina/2) + "px", height: this.pocetnaVisina + "px", display: "block"});
		}
	}
	
	nacrtaj() {
		if (this.aktivnoSw) {
		    var vrijeme = performance.now();
			
			var visin = (vrijeme - this.time) / 1000 * this.brzina + this.pocetnaVisina;
			
			if (Math.floor((vrijeme-this.time)/40) % 2 == 0) {
				dodajStilove(this.slikaOruzja, {opacity: "1"});
				dodajStilove(this.slikaOruzja1, {opacity: "0"});
			} else {
				dodajStilove(this.slikaOruzja, {opacity: "0"});
				dodajStilove(this.slikaOruzja1, {opacity: "1"});
			}
			
			if (visin > visina) {
				this.aktivnoSw = false;
				this.y = 0;
				dodajStilove(this.el, {height: "0px", display: "none"});
			} else {
				this.y = visin;
		        dodajStilove(this.el, {height: visin + "px"});
		    }
		
	    }
	}
}

class Igrac {
	constructor({vis, sir, x, brzinaKretanja=130}) {
		this.visina = vis;
		this.sirina = sir;
		this.x = x;
		
		this.time = null; //performance.now();
		this.smjerKretanja = null;             // za null igrac stoji, za "l"/"d" igrac se krece lijevo/desno
		this.brzinaKretanja = brzinaKretanja;  // brzina kretanja u pikselima po sekundi
		this.stranaPucaljke = "l";             // za l/d pucaljka igraca se nalazi na lijevoj/desnoj strani
		
		this.el = document.createElement("div");			
		this.id = "igrac";
		this.el.id = this.id;
		dodajStilove(this.el, {height: this.visina + "px", width: this.sirina + "px", position: "absolute", backgroundColor: "white",
			                  bottom: "0px", left: (this.x - this.sirina/2) + "px"});
			                  
		var el1 = document.createElement("div");			
		el1.id = "glava";
		dodajStilove(el1, {height: 0.7*this.sirina + "px", width: 0.7*this.sirina + "px", backgroundColor: "#0596f0", position: "absolute",
			                  top: 0.1*this.sirina + "px", left: 0.15*this.sirina + "px", borderRadius: "50%", zIndex: "5"});
		this.el.appendChild(el1);
		
		el1 = document.createElement("div");			
		el1.id = "tijelo";
		dodajStilove(el1, {height: 0.8*this.sirina + "px", width: 0.8*this.sirina + "px", backgroundColor: "blue", position: "absolute",
			                  top: 0.55*this.sirina + "px", left: 0.1*this.sirina + "px", zIndex: "4"});
		this.el.appendChild(el1);
		
		el1 = document.createElement("div");			
		el1.id = "noga1";
		dodajStilove(el1, {height: 0.5*this.sirina + "px", width: 0.2*this.sirina + "px", backgroundColor: "#ecbcb4", position: "absolute",
			                  bottom: "0px", left: 0.2*this.sirina + "px", zIndex: "3"});
		this.el.appendChild(el1);
		
		el1 = document.createElement("div");			
		el1.id = "noga2";
		dodajStilove(el1, {height: 0.5*this.sirina + "px", width: 0.2*this.sirina + "px", backgroundColor: "#ecbcb4", position: "absolute",
			                  bottom: "0px", right: 0.2*this.sirina + "px", zIndex: "3"});
		this.el.appendChild(el1);
		
	    this.pucaljka = document.createElement("div");			
		this.pucaljka.id = "pucaljka";
		dodajStilove(this.pucaljka, {height: 1.0*this.sirina + "px", width: 0.25*this.sirina + "px", backgroundColor: "black", position: "absolute",
			                  top: "0px", left: 0.2*this.sirina + "px", zIndex: "3"});
		this.el.appendChild(this.pucaljka);
			                  
	    //dodajStilove(this.pucaljka, {left: null, right: 0.2*this.sirina + "px"});  //  nacin kako tokom igre mjenjati poziciju pucaljke lijevo/desno
	    //dodajStilove(this.pucaljka, {right: null, left: 0.2*this.sirina + "px"});
	    
		document.querySelector(".display").appendChild(this.el);
		
		this.nacrtaj = this.nacrtaj.bind(this);
		this.vratiPolozajPucaljke = this.vratiPolozajPucaljke.bind(this);
	}
	
	vratiPolozajPucaljke() {
		if (this.stranaPucaljke === "l") {
			console.log("aa " + 0.2*this.sirina);
			return this.x - this.sirina/2 + 0.2*this.sirina + 0.125*this.sirina;
		} else {
			console.log("bb " + 0.55*this.sirina);
			return this.x - this.sirina/2 + 0.55*this.sirina + 0.125*this.sirina;
		}
	}
	
	nacrtaj() {
		var vrijeme = performance.now();
		if (this.time === null) {
			var dt = 0;
			this.time = vrijeme;
		} else {
			var dt = vrijeme - this.time;
			this.time = vrijeme;
		}
		
		if (this.smjerKretanja !== null) {
		    var noviX = this.x;
		    if (this.smjerKretanja === "l") {
				if (this.stranaPucaljke !== "l") {
					this.stranaPucaljke = "l";
					dodajStilove(this.pucaljka, {right: null, left: 0.2*this.sirina + "px"});
				}
			    noviX -= this.brzinaKretanja * dt / 1000; 
			    if (noviX < this.sirina/2) noviX = this.sirina/2;
		    } else if (this.smjerKretanja === "d") {
				if (this.stranaPucaljke !== "d") {
					this.stranaPucaljke = "d";
					dodajStilove(this.pucaljka, {left: null, right: 0.2*this.sirina + "px"});
				}
			    noviX += this.brzinaKretanja * dt / 1000;
			    if (noviX > sirina - this.sirina/2)  noviX = sirina - this.sirina/2;
		    }
		    
		    if (this.x !== noviX) {
			    this.x = noviX;
			    dodajStilove(this.el, {left: (this.x - this.sirina/2) + "px"});
		    }
	    }
	}
}

class Lopta {
	// konstruktor lopte. size je velicina lopte 1-4, vx/vy su komponente brzina, x/y su koordinate pocetne pozicije lopte
	// g je opcijski parametar gravitacije, a hMax je max. visina loptice, ona efektivno zadaje energiju lopte, znaci od donjeg brida/poda do donje strane loptice u njezinoj najvisoj poziciji
	constructor({size, vx, vy, hMax, x, y, g=700}) {
		this.size = size;
		
		this.vx = vx;
		this.vy = vy;
		this.g = g;
		console.log("g je " + g);
		
		this.x = x;
		this.y = y;
		this.time = null; //performance.now();
		//console.log("vrijeme je postavljeno na " + this.time);
		
		switch (this.size) {
			case (1):
			    this.radius = Math.floor(visina / 10);
			    break;
			case (2):
			    this.radius = Math.floor(visina / 15);
			    break;
			case (3):
			    this.radius = Math.floor(visina / 30);
			    break;
			case (4):
			    this.radius = Math.floor(visina / 60);
			    break;    
			default: 
			    alert("ilegalna velicina kuglice");
			    this.radius = 20;
		}
		console.log("radijus je " + this.radius);
		this.hMax = hMax; //- this.radius;
		this.hMax1 = visina - this.y - this.radius  +  (this.vy)**2 / 2 / this.g; 
		
		this.termalizacija = 0;
		if (false) {  // za true termaliziramo loptu odmah prilikom inicijalizacije, lopta dobija zadanu energiju
			this.termalizacija = 0;
		    let vv = 2*this.g*(this.hMax - visina + this.y + this.radius);
		    console.log("g, hMax, visina, y, radius " + this.g + ", " + this.hMax + ", " + visina + ", " + this.y + ", " + this.radius);
		    if (vv < 0) {
			    this.hMax = visina - this.y - this.radius;
			    this.vy = 0;	
			} else {
		        if (this.vy < 0) {
				    this.vy = -1 * Math.sqrt(vv);
			    } else {
				    this.vy = Math.sqrt(vv);
			    }
			}
			console.log("inic vy " + this.vy + " / " + vv + " g/ " + this.g);
		}
		
		
		
		this.newId = idGen();
		console.log("upravo si kreirao loptu sa id " + this.newId);
		
		this.el = document.createElement("div");			
		this.id = "id" + this.newId;
		this.el.id = this.id;
		dodajStilove(this.el, {height: 2*this.radius + "px", width: 2*this.radius + "px", borderRadius: "50%", backgroundColor: "red", position: "absolute",
			                  top: (this.y - this.radius) + "px", left: (this.x - this.radius) + "px"});
		document.querySelector(".display").appendChild(this.el);
		
		this.nacrtaj = this.nacrtaj.bind(this);
		this.interakcijaOruzje= this.interakcijaOruzje.bind(this);
		this.reduciraj = this.reduciraj.bind(this);
	}
	
    interakcijaOruzje(oruzje) {
		if (oruzje.aktivnoSw  &&  this.radius + this.y >= visina - oruzje.y) {
			if (this.y > visina - oruzje.y) {   // interakcija sa konopom
			    var tt = this.radius + oruzje.sirina/2;
		        if (this.x >= oruzje.x - tt   &&   this.x <= oruzje.x + tt)  return true;	
			} else {  // interakcija sa strijelom
			    if (this.radius**2 >= (oruzje.x - this.x)**2 + (visina - oruzje.y - this.y)**2)  return true;	
			}
		}
		return false;
    }
    
    reduciraj() {
		let rez = []; let l = null;
		switch (this.size) {
			case (1):
			    l = new Lopta({size:2, vx:-1*Math.abs(this.vx), vy:pocetnaVy, hMax:visMax2, x:this.x-this.radius/2, y:this.y, g:this.g});
	            rez.push(l);
	            l = new Lopta({size:2, vx:Math.abs(this.vx), vy:pocetnaVy, hMax:visMax2, x:this.x+this.radius/2, y:this.y, g:this.g});
			    rez.push(l);
			    break;
			case (2):
			    l = new Lopta({size:3, vx:-1*Math.abs(this.vx), vy:pocetnaVy, hMax:visMax3, x:this.x-this.radius/2, y:this.y, g:this.g});
	            rez.push(l);
	            l = new Lopta({size:3, vx:Math.abs(this.vx), vy:pocetnaVy, hMax:visMax3, x:this.x+this.radius/2, y:this.y, g:this.g});
			    rez.push(l);
			    break;
			case (3):
			    l = new Lopta({size:4, vx:-1*Math.abs(this.vx), vy:pocetnaVy, hMax:visMax4, x:this.x-this.radius/2, y:this.y, g:this.g});
	            rez.push(l);
	            l = new Lopta({size:4, vx:Math.abs(this.vx), vy:pocetnaVy, hMax:visMax4, x:this.x+this.radius/2, y:this.y, g:this.g});
			    rez.push(l);
			    break;
			case (4):
			    break;    
			default: 
			    alert("ilegalna velicina kuglice");
		}
		
		document.querySelector(".display").removeChild(this.el);
	    return rez;
		
	}
    	
	nacrtaj() {
		var vrijeme = performance.now();
		if (this.time === null) {
			var dt = 0;
			this.time = vrijeme;
		} else {
			var dt = vrijeme - this.time;
			this.time = vrijeme;
		}
		
		//console.log("vy " + this.vy);
		
		var noviX = this.x + this.vx * dt/1000;
		
		
		if (noviX - this.radius < 0) {
			let dt1 = -1 * (this.radius - noviX) / this.vx * 1000;
			//let dt2 = -1 * (this.x - this.radius) / this.vx;
			let dt2 = dt - dt1;
			
			noviX = this.x + dt2/1000 * this.vx + dt1/1000 * (-1) * this.vx;
			this.vx *= -1;
		} else if (noviX + this.radius > sirina) {
			//console.log("noviX/radius/sirina:" + noviX + " / " + this.radius + " / " + sirina);
			let dt1 = (noviX + this.radius - sirina) / this.vx * 1000;
			let dt2 = dt - dt1;
			noviX = this.x + dt2/1000 * this.vx + dt1/1000 * (-1) * this.vx;
			this.vx *= -1;
		}
		
		var noviY = this.y + this.vy * dt/1000;
		
		if (this.vy < 0) {
		    /*if (noviY - this.radius < 0) {
			    let dt1 = -1 * (this.radius - noviY) / this.vy * 1000;
			    //let dt2 = -1 * (this.x - this.radius) / this.vx;
			    let dt2 = dt - dt1;
			
			    noviY = this.y + dt2/1000 * this.vy + dt1/1000 * (-1) * this.vy;
			    this.vy *= -1;
		    } else if (noviY + this.radius > visina) {
			    //console.log("noviX/radius/sirina:" + noviX + " / " + this.radius + " / " + sirina);
			    let dt1 = (noviY + this.radius - visina) / this.vy * 1000;
			    let dt2 = dt - dt1;
			    noviY = this.y + dt2/1000 * this.vy + dt1/1000 * (-1) * this.vy;
			    this.vy *= -1;
		    }*/
		    
		    //let vMax = Math.sqrt(2*this.hMax*this.g);
			//let vMax1 = Math.sqrt(2*this.hMax1*this.g);
			
			if (this.hMax1 > visina - 2*this.radius) {
				
			    let vMax1 = Math.sqrt(2*(this.hMax1-visina+2*this.radius)*this.g);
			    let dt1 = (-1*vMax1 - this.vy) / this.g * 1000;
			    
			    if (dt1 > dt) {
				    noviY = this.y + this.vy*dt/1000 + this.g/2 * (dt/1000)**2;
				    this.vy = this.vy + this.g * dt / 1000;
			    } else {
				    let dt2 = dt - dt1;
				
				    noviY = this.radius + vMax1 * dt2 / 1000 + this.g/2* (dt2/1000)**2;
				    this.vy = vMax1 + this.g/2* dt2/1000;
			    }
			     
			} else {
			    noviY = this.y + this.vy*dt/1000 + this.g/2 * (dt/1000)**2;
		        this.vy = this.vy + this.g * dt / 1000;	
			}
		    
	    } else {
			
			let vMax = Math.sqrt(2*this.hMax*this.g);
			let vMax1 = Math.sqrt(2*this.hMax1*this.g);
			let dt1 = (vMax1 - this.vy) / this.g * 1000;
			
			if (dt1 > dt) {
				noviY = this.y + this.vy*dt/1000 + this.g/2 * (dt/1000)**2;
				this.vy = this.vy + this.g * dt / 1000;
			} else {
				let dt2 = dt - dt1;
				
				noviY = visina - this.radius - vMax * dt2 / 1000 + this.g/2* (dt2/1000)**2;
				this.vy = -1*vMax + this.g/2* dt2/1000;
				this.hMax1 = this.hMax;
			}
			
		}
		
		
		
		this.x = noviX;
		this.y = noviY;
		
		dodajStilove(this.el, {top: (noviY-this.radius) + "px", left: (noviX-this.radius) + "px"});
	}
    
}

function idGenerator() {
    var br = 0;
	function fun() {
	    br = br + 1;
		return br;
	}
	
	return fun;
}

function dodajStilove(el, stilovi) {
    for (let key in stilovi) {
	    el.style[key] = stilovi[key];
	}
}

