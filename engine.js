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

//let igr = null;  //  privremena debug konstrukcija

var pauzaSw = [false];  //  za true su objekti na displayu zamrznuti   
var pauza = null;    //  privremena debug konstrukcija 
 
window.onload = function() {
	//ispis_sinusoide();
	
	inicijalizirajDisplay(visina, sirina, 25);
	var zvukBang = new Zvuk({file: "bang.wav", brOverlap: 5, volume:0.7});
	pauza = new Pauza();
	
	//var pauzaSw = false;  //  za true su objekti na displayu zamrznuti
	
	//pauziraj(4000, [pauzaSw]);
	
	let poljeLopti = [];
	
	//let l = new Lopta({size:4, vx:110, vy:0, hMax:visMax1, x:130, y:100, g:1*700, xPoc: 200, inicSw: false});
	//poljeLopti.push(l);
	
	ubacujLopte(poljeLopti, pauzaSw);
	
	if (false) {
	let l = new Lopta({size:1, vx:110, vy:0, hMax:visMax1, x:130, y:100, g:1*700});
	poljeLopti.push(l);
	l = new Lopta({size:2, vx:-110, vy:40, hMax:visMax2, x:330, y:100, g:1*700});
	poljeLopti.push(l);
    }
	
	let poljeEksplozija = [];
	
	//window.requestAnimationFrame(l.nacrtaj);
	
	let igr = new Igrac({vis: 110, sir: 70, x: 300, brzinaKretanja: 150});
	let oruzje = [new Oruzje({sir: 30, brz: 300}), new Oruzje({sir: 30, brz: 300})];
	
	let kontrole = new Kontrole({igracObjekt: igr, oruzjeObjekt: oruzje});
	
	if (false) {
	var idtimer = setInterval(oruzje[0].nacrtaj, 50);
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
		
	l = new Lopta({size:4, vx:-110, vy:40, hMax:visMax2, x:380, y:590, g:700});	
	var idtimer = setInterval(() => {igr.nacrtaj(); if (l.interakcijaIgrac(igr))  alert("sudar");}, 20);
	setTimeout(()=> {clearTimeout(idtimer)}, 30000);
    }
    
    if (true) {
	var idtimer = setInterval(() => {
		igr.nacrtaj(); 
		oruzje[0].nacrtaj();
		oruzje[1].nacrtaj();
		
		let treperenjeStatus = pauza.treperenjeSw();
		
		for (let i = poljeLopti.length-1; i > -1; i--) {
			let obj = poljeLopti[i];
			
			if (!pauzaSw[0] && obj.interakcijaIgrac(igr))  alert("sudar");
			
		    obj.nacrtaj(treperenjeStatus);
		    
		    for (let j = 0; j < 2; j++) {
		        if (obj.interakcijaOruzje(oruzje[j])) {
					if (obj.ucinak == 1)  pauza.dodajVrijeme(2000); //pauziraj(2000, pauzaSw);
				    oruzje[j].ugasi();
				    console.log("pogodak!");	
				    zvukBang.sviraj();
				
				    let dimenzije = obj.vratiPoziciju();
				    let an = new Animacija({sir: 2*dimenzije[2], vis: 2*dimenzije[2], x:dimenzije[0], y:dimenzije[1], vrijeme: 400});
				    an.aktiviraj();
				    poljeEksplozija.push(an);
				
				    poljeLopti.push(...obj.reduciraj());
				    poljeLopti.splice(i, 1);
				    break;
			    }
		    }
		}
		
		for (let i = poljeEksplozija.length-1; i > -1; i--) {
		    let obj = poljeEksplozija[i];
		    if (!obj.nacrtaj())  poljeEksplozija.splice(i, 1);
	    }
	}, 20);
	setTimeout(()=> {clearTimeout(idtimer)}, 600000);
    }
}


class Pauza {
	constructor() {
		this.vrijeme = 0;
		this.ref = null;
		this.tim = performance.now();
		
		this.dodajVrijeme = this.dodajVrijeme.bind(this);
		this.refreshaj = this.refreshaj.bind(this);
		this.treperenjeSw = this.treperenjeSw.bind(this);
	}
	
	treperenjeSw() {
		if (!pauzaSw[0]) return false;
		if ( Math.floor((performance.now()-this.tim) /150) % 2 === 0) {
			return true;
		} else {
			return false;
		}
	}
	
	dodajVrijeme(time) {
		this.vrijeme += time;
		console.log("Novo vrijeme je " + this.vrijeme);
		pauzaSw[0] = true;
		clearTimeout(this.ref);
		this.refreshaj();
	}
	
	refreshaj() {
		
		if (this.vrijeme <= -1000) {
			this.vrijeme = 0;
			pauzaSw[0] = false;
		    dodajStilove(document.querySelector("#poruka"), {display: "none"});
		} else {
			dodajStilove(document.querySelector("#poruka"), {display: "block"});
		    document.querySelector("#poruka-tekst").innerHTML = "Last " + Math.floor(this.vrijeme/1000) + "s.";
		    this.vrijeme -= 1000;
			
			this.ref = setTimeout(()=> {this.refreshaj()}, 1000);
		}
	}
}



function ubacujLopte(poljeLopti, pauzaSw) {
	let loptaTip = Math.floor(Math.random()*3)+1;
	console.log("Upravo inicijaliziramo loptu tip " + loptaTip);
	let l = new Lopta({size:loptaTip, vx:110 * (Math.floor(Math.random()*2) - 0.5)*2, vy:0, hMax:tip(loptaTip), x:130, y:100, g:1*700, xPoc: Math.floor(Math.random()*700 +100), inicSw: true});
	poljeLopti.push(l);
	setTimeout(() => {ubacujLopte(poljeLopti)}, 6000);
	
	function tip(ltip) {
		switch (ltip) {
			case (1):
			    return visMax1;
			case (2):
			    return visMax2;
			case (3):
			    return visMax3;
		}
		return visMax4;
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
				        //console.log("Stisnuo si Lijevu strelicu " + Math.random());
				    }
				    break;
				case ("ArrowRight"):
				    if (this.keyDown !== "ArrowRight") {
				        this.keyDown = "ArrowRight";
				        this.igracObjekt.smjerKretanja = "d";
				        //console.log("Stisnuo si desnu strelicu " + Math.random());
				    }
				    break;	
			}
		//}
		
		if (ev.code === "KeyS") {
			console.log("stisnuo si gumb S " + Math.random());
			//console.log("polozaj pucaljke je " + this.igracObjekt.vratiPolozajPucaljke());
			if (this.oruzjeObjekt[0].aktivnoSw) {
			    this.oruzjeObjekt[1].pucaj(this.igracObjekt.vratiPolozajPucaljke());
			} else {
				this.oruzjeObjekt[0].pucaj(this.igracObjekt.vratiPolozajPucaljke());
			}
		}
		
		if (ev.code === "KeyQ") {
			console.log("vraceni podaci " + igr.vratiPolozajGlave());
		}
		
		if (ev.code === "KeyW") {
			console.log("vraceni podaci " + igr.vratiPolozajTijela());
		}
		
		if (ev.code === "KeyP") {
			pauza.dodajVrijeme(4000);
			console.log("pauzaSw prekidac je " + pauzaSw[0]);
		}
		
	}
	
	pritisakGumbaUp(ev) {	
	    switch (ev.code) {
			case ("ArrowLeft"):
			    if (this.keyDown == "ArrowLeft") {
				    this.keyDown = false;
				    this.igracObjekt.smjerKretanja = null;
				    //console.log("Otpustio si lijevu strelicu " + Math.random());
			    }
				break;
			case ("ArrowRight"):
			    if (this.keyDown == "ArrowRight") {
				    this.keyDown = false;
				    this.igracObjekt.smjerKretanja = null;
				    //console.log("Otpustio si desnu strelicu " + Math.random());
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
		//this.id = "oruzje";
		//this.el.id = this.id;
		dodajStilove(this.el, {width: this.sirina + "px", height: this.pocetnaVisina + "px", position: "absolute",
			                  bottom: "0px", display: "none", overflow: "hidden"});
			                  
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
			                  
		this.glava = document.createElement("div");			
		this.glava.id = "glava";
		dodajStilove(this.glava, {height: 0.7*this.sirina + "px", width: 0.7*this.sirina + "px", backgroundColor: "#0596f0", position: "absolute",
			                  top: 0.1*this.sirina + "px", left: 0.15*this.sirina + "px", borderRadius: "50%", zIndex: "5"});
		this.el.appendChild(this.glava);
		
		this.tijelo = document.createElement("div");			
		this.tijelo.id = "tijelo";
		dodajStilove(this.tijelo, {height: 0.8*this.sirina + "px", width: 0.8*this.sirina + "px", backgroundColor: "blue", position: "absolute",
			                  top: 0.55*this.sirina + "px", left: 0.1*this.sirina + "px", zIndex: "4"});
		this.el.appendChild(this.tijelo);
		
		var el1 = document.createElement("div");			
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
		
		this.vratiPolozajGlave = this.vratiPolozajGlave.bind(this);
	}
	
	vratiPolozajGlave() {   // vraca polje uredene trojke x, y, r, koordinate centra glave i radijusa glave
		if (typeof this._glavaSirina === "undefined")  this._glavaSirina = parseFloat(this.glava.style.height);
		if (typeof this._glavaTop === "undefined")   this._glavaTop = parseFloat(this.glava.style.top);
		if (typeof this._glavaLeft === "undefined")  this._glavaLeft = parseFloat(this.glava.style.left);
		
		return [(this.el.offsetLeft + this._glavaLeft + this._glavaSirina/2), (this.el.offsetTop + this._glavaTop + this._glavaSirina/2), this._glavaSirina/2];
	}
	
	vratiPolozajTijela() {  // vraca polje uredene cetvorke, x, y, sir, vis, koordinate centra pravokutnika, njegovu sirinu i visinu
		if (typeof this._tijeloSirina === "undefined")  this._tijeloSirina = parseFloat(this.tijelo.style.width);
		if (typeof this._tijeloVisina === "undefined")  this._tijeloVisina = parseFloat(this.tijelo.style.height);
		if (typeof this._tijeloTop === "undefined")  this._tijeloTop = parseFloat(this.tijelo.style.top);
		if (typeof this._tijeloLeft === "undefined")  this._tijeloLeft = parseFloat(this.tijelo.style.left);
		
		return [(this.el.offsetLeft + this._tijeloLeft + this._tijeloSirina/2), (this.el.offsetTop + this._tijeloTop + this._tijeloVisina/2), this._tijeloSirina, this._tijeloVisina];
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
	// za inicSw inicijaliziramo loptu sa vrha displaya, za false je samo postavljamo na ekran. xPoc kod inicijalizacije zadaje x koordinatu lopte
	// ucinak opcija za 0 proizvodi klasicnu standardnu loptu, za 1 proizvodi treperujucu loptu koja kod ponistanje pauzira igru na odredeno vrijeme.
	constructor({size, vx, vy, hMax, x, y, g=700, xPoc, inicSw=false, ucinak=0}) {
		this.size = size;
		
		this.vx = vx;
		this.vy = vy;
		this.g = g;
		this.ucinak = ucinak;
		
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
		
		this.inicSw = inicSw;
		this.inicBr = 0;
		if (this.inicSw) {
		    this.x = xPoc;
		    //this.y = 30;
		    this.inicijalizacijskaFaza();
		} else {
			this.x = x;
		    this.y = y;
		}
		
		
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
		
		if (inicSw) {
			this.boja = "#a60303";
		} else {
			this.boja = "red";
		}
		dodajStilove(this.el, {height: 2*this.radius + "px", width: 2*this.radius + "px", borderRadius: "50%", backgroundColor: this.boja, position: "absolute",
			                  top: (this.y - this.radius) + "px", left: (this.x - this.radius) + "px", zIndex: 6});
		document.querySelector(".display").appendChild(this.el);
		
		this.nacrtaj = this.nacrtaj.bind(this);
		this.interakcijaOruzje= this.interakcijaOruzje.bind(this);
		this.interakcijaIgrac = this.interakcijaIgrac.bind(this);
		this.reduciraj = this.reduciraj.bind(this);
		this.vratiPoziciju = this.vratiPoziciju.bind(this);
		this.inicijalizacijskaFaza = this.inicijalizacijskaFaza.bind(this);
	}
	
	inicijalizacijskaFaza() {
		var yPozicije = [[-1*this.radius, -0.5*this.radius, 0*this.radius, 0.5*this.radius, this.radius],[],[],[]];
		this.y = yPozicije[0][this.inicBr];
		//console.log("y je " + this.y);
		if (pauzaSw[0]) {
			setTimeout(() => {this.inicijalizacijskaFaza()}, 1500);
			return true;
		}
		this.inicBr++;
		if (this.inicBr >= 5) {
			this.inicSw = false;
			this.hMax1 = visina - this.y - this.radius  +  (this.vy)**2 / 2 / this.g; 
			this.boja = "red";
			dodajStilove(this.el, {backgroundColor: this.boja});
		} else {
			setTimeout(() => {this.inicijalizacijskaFaza()}, 1500);
		}
	}
	
	vratiPoziciju() {
		console.log("vracam " + this.radius);
		return [this.x, this.y, this.radius];
	}
	
	interakcijaIgrac(igrac) {
		var par = igrac.vratiPolozajGlave();
		if ( (this.x-par[0])**2 + (this.y-par[1])**2 <= (this.radius+par[2])**2) return true;  // interakcija sa glavom
		
		par = igrac.vratiPolozajTijela();  // x, y, sir, vis
		if (par[0] - par[2]/2 - this.radius > this.x  ||  par[0] + par[2]/2 + this.radius < this.x || 
		    par[1] - par[3]/2 - this.radius > this.y  ||  par[1] + par[3]/2 + this.radius < this.y)  return false;
		
		// interakcija sa bridovima
		if (par[0] - par[2]/2 < this.x  &&  par[0] + par[2]/2 > this.x)  return true;
		if (par[1] - par[3]/2 < this.y  &&  par[1] + par[3]/2 > this.y)  return true;
		
		// interakcija sa rubovima
		if (  (this.x - par[0] + par[2]/2)**2 + (this.y - par[1] + par[3]/2)**2 <= this.radius**2   ||   
		      (this.x - par[0] - par[2]/2)**2 + (this.y - par[1] + par[3]/2)**2 <= this.radius**2   ||
		      (this.x - par[0] + par[2]/2)**2 + (this.y - par[1] - par[3]/2)**2 <= this.radius**2   ||
		      (this.x - par[0] - par[2]/2)**2 + (this.y - par[1] - par[3]/2)**2 <= this.radius**2 )  return true;
		
		return false;
	}
	
    interakcijaOruzje(oruzje) {
		if (!this.inicSw  &&  oruzje.aktivnoSw  &&  this.radius + this.y >= visina - oruzje.y) {
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
			    let ucinci = [0,0];
			    if (Math.random() < 0.4) {
					if (Math.random() < 0.5) {
						ucinci = [0,1];
					} else {
						ucinci = [1,0];
					}
				}
				console.log("ucinak je " + ucinci);
			    l = new Lopta({size:4, vx:-1*Math.abs(this.vx), vy:pocetnaVy, hMax:visMax4, x:this.x-this.radius/2, y:this.y, g:this.g, ucinak: ucinci[0]});
	            rez.push(l);
	            l = new Lopta({size:4, vx:Math.abs(this.vx), vy:pocetnaVy, hMax:visMax4, x:this.x+this.radius/2, y:this.y, g:this.g, ucinak: ucinci[1]});
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
    	
	nacrtaj(treperenjeStatus=false) {
	  if (treperenjeStatus) {
		  var disp = "none";
	  } else {
		  var disp = "block";
	  }	
		
	  if (this.inicSw) {
		dodajStilove(this.el, {top: (this.y-this.radius) + "px", left: (this.x-this.radius) + "px", display: disp});  
	  } else {	
		var vrijeme = performance.now();
		if (this.time === null) {
			var dt = 0;
			this.time = vrijeme;
			this.pocetnoVrijeme = vrijeme;
		} else {
			var dt = vrijeme - this.time;
			this.time = vrijeme;
		}
		
		if (pauzaSw[0])  dt = 0;
		
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
		
		if (this.ucinak === 1  &&  Math.floor( (this.time - this.pocetnoVrijeme) / 100) % 2 == 1  ) {
			this.boja = "#f7cdcd";
		} else {
			this.boja = "red";
		}   
		
		dodajStilove(this.el, {top: (noviY-this.radius) + "px", left: (noviX-this.radius) + "px", backgroundColor: this.boja, display: disp});
	  }	
	}
    
}

class Animacija {
	constructor({sir, vis=sir, x=sir/2, y=vis/2, vrijeme=1000}) {
		this.sirina = sir;
		this.visina = vis;
		this.x = x;
		this.y = y;
		
		this.spriteX = 0;
		this.spriteY = 0;
		
		this.aktivnaSw = false;
		this.time = null;
		this.frame = 0;
		this.timeFrame = vrijeme / 25;
		
		this.el = document.createElement("div");
		dodajStilove(this.el, {height: this.visina + "px", width: this.sirina + "px", overflow: "hidden", position: "absolute",
                               top: this.y - this.visina/2 + "px", left: this.x - this.sirina/2 + "px", zIndex: "7"});
                               
        this.sprite = document.createElement("div");
		dodajStilove(this.sprite, {height: 500 + "%", width: 500 + "%", position: "absolute", backgroundImage: "url('pngegg.png')",
                               backgroundSize: "cover", backgroundRepeat: "no-repeat", top: this.spriteY + "%", left: this.spriteX + "%"});
        this.el.appendChild(this.sprite);
                               
                               
        document.querySelector(".display").appendChild(this.el);
        
        this.postaviFrame = this.postaviFrame.bind(this);
        this.aktiviraj = this.aktiviraj.bind(this);
        this.nacrtaj = this.nacrtaj.bind(this);
	}
	
	nacrtaj() {
		if (this.aktivnaSw) {
			let vrijeme = performance.now();
			let nvfr = Math.floor((vrijeme-this.time)/this.timeFrame);
			if (this.frame !== nvfr) {
				this.frame = nvfr;
				this.postaviFrame(this.frame);
			}
			if (nvfr >= 24) {
				this.frame = 24;
				this.aktivnaSw = false;
				document.querySelector(".display").removeChild(this.el);
				return false;
			}
			return true;
		}
		return false;
	}
	
	aktiviraj() {
		if (!this.aktivnaSw) {
			this.aktivnaSw = true;
			this.time = performance.now();
			this.frame = 0;
		}
	}
	
	postaviFrame(br) {
		this.spriteY = Math.floor(br/5) % 5 * (-100);
		this.spriteX = br % 5 * (-100);
		dodajStilove(this.sprite, {top: this.spriteY + "%", left: this.spriteX + "%"});
	}
}

class Zvuk {
	constructor({file, brOverlap=1, volume=1}) {
		this.count = 0;
		this.br = brOverlap;
		this.volume = this.logVolume(volume)/100;
		 
		this.polje = []
		for (var i = 0; i < this.br; i++) {
			let a = new Audio(file);
			a.volume = this.volume;
            this.polje.push(a);
        }
        
        this.sviraj = this.sviraj.bind(this);
	}
	
	sviraj() {
		this.polje[this.count].play();
		this.count = (this.count+1) % this.br;
	}
	
	logVolume(x) {
		if (x == 0) return 0;
		return Math.exp(5.116 * (x-0.1));
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

