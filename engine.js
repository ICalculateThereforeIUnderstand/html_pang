import inicijalizirajDisplay from "./inicijalizirajDisplay.js";
import Indikatori from "./indikatori.js";
import {Animacija, Zvuk, LeteciBroj, StartajIgru} from "./razneKlase.js";

const sirina = 900;
const visina = 600;

const pocetnaVy = -300;   //  pocetna brzina novonastale manje loptice
const visMax1 = 440;
const visMax2 = 370;
const visMax3 = 240;
const visMax4 = 140;

var idGen = idGenerator();

var pauzaSw = [false];  //  za true su objekti na displayu zamrznuti   
var pauza = null;   
var muzika = null;  
 
window.onload = function() {
	
	inicijalizirajDisplay(visina, sirina, 25);
	let indikatori = new Indikatori({brZivota:0, bodovi:0, level:1, progres:0, bojaPozadine:"black", bojaSlova:"#11d6f0"});
	
	muzika = new Zvuk({file: "muzika.mp3", brOverlap: 2, volume:0.7, loop: true});
	pauza = new Pauza();
	
	var engin = new Engine({indikatori, pauza});
	
	engin.start.startaj();
	
}

class Engine {
	constructor({indikatori, pauza}) {
	    this.zvukBang = new Zvuk({file: "bang.wav", brOverlap: 10, volume:0.7});	
	    
	    this.start = new StartajIgru(this, muzika);
	    this.pauza = pauza;
	    this.indikatori = indikatori;

	    this.poljeLetecihBrojeva = [];
	    this.igr = null;
	    this.oruzje = [new Oruzje({sir: 30, brz: 300}), new Oruzje({sir: 30, brz: 300})];
	    this.kontrole = null;
	    this.engineAktivanSw = false;
	    this.ubacujLopteRef = null;
	    this.poljeLopti = [];	
	    this.poljeEksplozija = [];
	    
	    this.engine = this.engine.bind(this);
	    this.iteracije = this.iteracije.bind(this);
	    this.ubacujLopte = this.ubacujLopte.bind(this);
	    
	    this.igr = new Igrac({vis: 110, sir: 70, x: sirina/2-35, brzinaKretanja: 200, vidljiv: false, vFrame: 200/14.5});  // odnos brzineKretanja i vFrame treba biti oko 14.5
	    this.kontrole = new Kontrole({igracObjekt: this.igr, oruzjeObjekt: this.oruzje, engine: this});
	    this.zvukLostLife = new Zvuk({file: "zvuk1.mp3", brOverlap: 1, volume:1.0});	
	    this.zvukGameOver = new Zvuk({file: "zvuk2.mp3", brOverlap: 1, volume:1.0});	
	}
	
	engine() {
		this.engineAktivanSw = true;
	    this.bodovi = 0;
	    this.brLives = 8;
	    this.progres = 0;
	    this.level = 1;
	    this.zadnjaPonistena = -1;
	    this.brZadnjihPonistenih = 0;
	    this.brUbacenihLopti = 0;
		this.igr.postaviIgraca();
	    this.indikatori.setBodovi(this.bodovi);
	    this.indikatori.setLives(this.brLives);
	    this.indikatori.setProgres(this.progres/16*100);
	    this.indikatori.setLevel(this.level);
	    this.indikatori.setBackground(this.level);
	
	    this.poljeLopti = [];	
	    this.poljeEksplozija = [];
    
        if (true) {
            this.iteracije();
        }
	}
    


    iteracije() {
		this.engineAktivanSw = true;
		this.brUbacenihLopti = 0;
		this.ubacujLopte(this.poljeLopti, pauzaSw);
	  
	    this.igr.time = null;
	    var anhilirajLopteSw = false;
		requestAnimationWrapper(() => {	
		    this.igr.nacrtaj(); 
		    this.oruzje[0].nacrtaj();
		    this.oruzje[1].nacrtaj();
		
		    let treperenjeStatus = this.pauza.treperenjeSw();
		
		    anhilirajLopteSw = false;
		    for (let i = this.poljeLopti.length-1; i > -1; i--) {
			    let obj = this.poljeLopti[i];
			
			    if (!pauzaSw[0] && obj.interakcijaIgrac(this.igr)) {
					this.engineAktivanSw = false;
					clearTimeout(this.ubacujLopteRef);
					muzika.ugasi();
					this.igr.izgubioZivot(obj);
					this.brLives--;
					
					this.indikatori.izgubioZivot();
					
					setTimeout(() => { 
					    this.zvukLostLife.sviraj();
					    requestAnimationWrapper(() => {  //  ogranak sa animacijom leta igraca poslje udara lopte
							let sw = this.igr.nacrtaj();
							if (!sw) {
								console.log("stop");
								obrisiElemente(this.poljeLopti);
								obrisiElemente(this.poljeEksplozija);
								obrisiElemente(this.poljeLetecihBrojeva);
								this.oruzje[0].ugasi();
								this.oruzje[1].ugasi();
					            
					            if (this.brLives > -1) {
					                //ovdje ide restart sekvenca
					                setTimeout(()=>{this.igr.postaviIgraca()}, 1000);
					                this.start.startajPonovo();
					            } else {  //  game over ogranak
									setTimeout(()=> {
									    this.zvukGameOver.sviraj();
									    this.start.gameOver();
									}, 1200);
								}
					            
							    return sw;
							};
							return true;
						});  //requestanimationwrapper					    
				    }, 800);

				    return false; // vracajuci false prekidamo requestanimation glavnu iteracijsku petlju
				}
			
		        obj.nacrtaj(treperenjeStatus);
		    
		        for (let j = 0; j < 2; j++) {
		            if (obj.interakcijaOruzje(this.oruzje[j])) {
					    this.progres++;
					    let stariBodovi = this.bodovi;
					    [this.zadnjaPonistena, this.brZadnjihPonistenih, this.bodovi] = this.updejtajBodove(this.zadnjaPonistena, this.brZadnjihPonistenih, obj, this.bodovi);
					    if (obj.ucinak !== 0) {
					        if (obj.ucinak == 1) { 
						        this.pauza.dodajVrijeme(2000);
					        } else if (obj.ucinak == 2) {
						        this.pauza.dodajVrijeme(5000);
					        } else if (obj.ucinak == 3) {
								anhilirajLopteSw = true;
						    }
				        }
				        this.oruzje[j].ugasi();
				        this.zvukBang.sviraj();
				
				        let dimenzije = obj.vratiPoziciju();
				        let an = new Animacija({sir: 2*dimenzije[2], vis: 2*dimenzije[2], x:dimenzije[0], y:dimenzije[1], vrijeme: 400});
				        an.aktiviraj();
				        this.poljeEksplozija.push(an);
				    
				        if (this.bodovi - stariBodovi >= 400) {
				            let lb = new LeteciBroj({broj: this.bodovi-stariBodovi, sir: 70, x:dimenzije[0], y:dimenzije[1], vy: 150, vrijeme: 700});
				            lb.aktiviraj();
				            this.poljeLetecihBrojeva.push(lb);
					    }
				
				        this.poljeLopti.push(...obj.reduciraj());
				        this.poljeLopti.splice(i, 1);
				        break;
			        }
		        }
		    }
		    
		    if (anhilirajLopteSw)  anhilirajSveLopte(this.poljeLopti, this.poljeEksplozija, this.zvukBang);
		
		    for (let i = this.poljeEksplozija.length-1; i > -1; i--) {
		        let obj = this.poljeEksplozija[i];
		        if (!obj.nacrtaj())  this.poljeEksplozija.splice(i, 1);
	        }
	    
	        for (let i = this.poljeLetecihBrojeva.length-1; i > -1; i--) {
		        let obj = this.poljeLetecihBrojeva[i];
		        if (!obj.nacrtaj())  this.poljeLetecihBrojeva.splice(i, 1);
	        }
	    
	        if (this.progres >= 17) {
			    this.level += Math.floor(this.progres / 17);
			    this.indikatori.setBackground(this.level);
			    this.progres = this.progres % 17;
		    }
		    this.indikatori.setProgres(this.progres/16*100);
		    this.indikatori.setLevel(this.level);
		    this.indikatori.setBodovi(this.bodovi);
		    
		    return true;  //  vracajuci true nastavljamo requestAnimation
	    
	    });
    }
    
    updejtajBodove(zadnja, br, lopta, bodovi) {
		let b = 0;
		switch (lopta.size) {
			case (1):
			    b = 100;
			    break;
			case (2):
			    b = 200;
			    break;
			case (3):
			    b = 300;
			    break;
			case (4):
			    b = 400;
			    break;
			default:
			    alert("fulao si negdje");
		}
		let trenutna = lopta.radius;
		if (lopta.sesterokutSw)  trenutna += 4;
		if (lopta.ucinak > 1)  b = 0;
		
		if (trenutna !== zadnja) {
			zadnja = trenutna;
			br = 1;
		} else {
			if (br < 4) {
				b *= 2**br;
				br++;
			} else {
				b *= 8;
			}
		}
		bodovi += b;
		return [zadnja, br, bodovi];
	}
	
	ubacujLopte(poljeLopti, pauzaSw) {
	    let loptaTip = Math.floor(Math.random()*3)+1;
	    let sestkutSw = Math.random() < 0.25 ? true : false; 
	    this.brUbacenihLopti++;
	    if (this.brUbacenihLopti % 10 == 0) {
			var l = new Lopta({size:loptaTip, vx:110 * (Math.floor(Math.random()*2) - 0.5)*2, vy:170, hMax:tip(loptaTip), x:130, y:100, g:1*700, xPoc: Math.floor(Math.random()*700 +100), inicSw: true, sesterokutSw: false, ucinak: 2}); 
		} else {
	        var l = new Lopta({size:loptaTip, vx:110 * (Math.floor(Math.random()*2) - 0.5)*2, vy:170, hMax:tip(loptaTip), x:130, y:100, g:1*700, xPoc: Math.floor(Math.random()*700 +100), inicSw: true, sesterokutSw: sestkutSw, ucinak: 0}); 
	    }
	    
	    poljeLopti.push(l);
	    this.ubacujLopteRef = setTimeout(() => {this.ubacujLopte(poljeLopti)}, 6000);
	
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
		
}

function requestAnimationWrapper(fun) {
    window.requestAnimationFrame(()=> {if (fun())  requestAnimationWrapper(fun)});
}


function anhilirajSveLopte(poljeLopti, poljeEksplozija, zvukBang) {
	let brInic = 0;
	for (let i = poljeLopti.length-1; i > -1; i--) {
	    let obj = poljeLopti[i];
	    if (obj.inicSw) {
			brInic++;
		} else {
			zvukBang.sviraj();
			let dimenzije = obj.vratiPoziciju();
		    let an = new Animacija({sir: 2*dimenzije[2], vis: 2*dimenzije[2], x:dimenzije[0], y:dimenzije[1], vrijeme: 400});
		    an.aktiviraj();
		    poljeEksplozija.push(an);
				
		    poljeLopti.push(...obj.reduciraj());
		    poljeLopti.splice(i, 1);
		}
	}
	
	if (poljeLopti.length > brInic) {
		setTimeout(() => {anhilirajSveLopte(poljeLopti, poljeEksplozija, zvukBang)}, 400);
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
	constructor({vis, sir, x, brzinaKretanja=130, g=700, vidljiv=true, vFrame=10}) {
		// vFrame je broj frameova po sekundi
		this.visina = vis;
		this.sirina = sir;
		this.g = g;
		this.x = x;
		this.y = visina - this.visina/2;
		this.vidljivSw = vidljiv;
		
		this.time = null; //performance.now();
		this.pocetnoVrijemeAnim = null;
		this.frame = 0;
		this.pocFrame = null;
		this.vFrame = vFrame;
		this.smjerKretanja = null;             // za null igrac stoji, za "l"/"d" igrac se krece lijevo/desno
		this.smjerKretanjaPrethodni = null;
		this.brzinaKretanja = brzinaKretanja;  // brzina kretanja u pikselima po sekundi
		this.stranaPucaljke = "d";             // za l/d pucaljka igraca se nalazi na lijevoj/desnoj strani
		
		this.liveLost = false;
		this.el = document.createElement("div");			
		this.id = "igrac";
		this.el.id = this.id;
		
		if (false) {
			var backgro = "white";
			var disp = "block";
		} else {
			var backgro = "transparent";
			var disp = "none";
		}
		
		dodajStilove(this.el, {height: this.visina + "px", width: this.sirina + "px", position: "absolute", backgroundColor: backgro,
			                  bottom: "0px", left: (this.x - this.sirina/2) + "px", overflow: "hidden"});
	    if (!this.vidljivSw)  dodajStilove(this.el, {display: "none"});
			                  
		this.glava = document.createElement("div");			
		this.glava.id = "glava";
	    dodajStilove(this.glava, {height: 0.4*this.sirina + "px", width: 0.4*this.sirina + "px", backgroundColor: "#0596f0", position: "absolute",
			                  top: 0.35*this.sirina + "px", left: 0.3*this.sirina + "px", borderRadius: "50%", zIndex: "5", display: disp});
		this.el.appendChild(this.glava);
		
			
		this.tijelo = document.createElement("div");			
		this.tijelo.id = "tijelo";
		dodajStilove(this.tijelo, {height: 1.0*this.sirina + "px", width: 0.5*this.sirina + "px", backgroundColor: "blue", position: "absolute",
			                  top: 0.6*this.sirina + "px", left: 0.25*this.sirina + "px", zIndex: "4", display: disp});
		this.el.appendChild(this.tijelo);
		
				
	    this.pucaljka = document.createElement("div");			
		this.pucaljka.id = "pucaljka";
		dodajStilove(this.pucaljka, {height: 1.0*this.sirina + "px", width: 0.25*this.sirina + "px", backgroundColor: "black", position: "absolute",
			                  top: "0px", left: 0.2*this.sirina + "px", zIndex: "3", display: disp});
		this.el.appendChild(this.pucaljka);
			                  
        this.sprite = document.createElement("img"); 
	    dodajStilove(this.sprite, {position: "absolute", height: "1600%", width: "600%",
			                    top: "16%", left: "0%", zIndex: "6"});
	    this.sprite.setAttribute("src", "sprite.png");
	    this.el.appendChild(this.sprite);
	    
		document.querySelector(".display").appendChild(this.el);
		
		this.nacrtaj = this.nacrtaj.bind(this);
		this.vratiPolozajPucaljke = this.vratiPolozajPucaljke.bind(this);
		
		this.vratiPolozajGlave = this.vratiPolozajGlave.bind(this);
		this.izgubioZivot = this.izgubioZivot.bind(this);
		this.postaviIgraca = this.postaviIgraca.bind(this);
	}
	
	postaviIgraca() {
		this.x = sirina/2;
		this.y = visina - this.visina/2;
		this.liveLost = false;
		this.vidljivSw = true;
		dodajStilove(this.el, {bottom: "0px", left: (this.x - this.sirina/2) + "px", display: "block"});
	}
	
	izgubioZivot(lopta) {
		this.liveLost = true;
		this.vx = -300*3;
		if (lopta.x < this.x)  this.vx *= -1;
		this.vy = -100*3;
		this.g = 1400;
		this.faza = 1;
		this.time = null;
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
			return this.x - 0.12 * this.sirina;
		} else {
			return this.x + 0.12 * this.sirina;
		}
	}
	
	nacrtaj() {
	  if (this.liveLost) {  // ovo je slucaj kada igrac je pogoden lopticom i kada leti po ekranu
		if (this.faza == 1) {  
		    var vrijeme = performance.now();
		    if (this.time === null) {
			    var dt = 0;
			    this.time = vrijeme;
			    if (this.vx > 0) {
	                dodajStilove(this.sprite, {top: -1200 + 16 + "%", left: -400 - 7 + "%"});
	            } else {
					dodajStilove(this.sprite, {top: -1400 + 16 + "%", left: 0 - 7 + "%"});
				}
		    } else {
			    var dt = vrijeme - this.time;
			    this.time = vrijeme;
		    }
		
		    var noviX = this.x + this.vx * dt/1000;
		
            if (noviX - this.sirina/2 < 0) {
			    let dt1 = -1 * (this.sirina/2 - noviX) / this.vx * 1000;
			    let dt2 = dt - dt1;
			
			    noviX = this.x + dt1/1000 * this.vx + dt2/1000 * (-1) * this.vx;
			    this.vx *= -1;
			    this.faza = 2;
			    this.faza2vrijeme = performance.now();  //  vrijeme pocetka faze2
		    } else if (noviX + this.sirina/2 > sirina) {
			    let dt1 = (noviX + this.sirina/2 - sirina) / this.vx * 1000;
			    let dt2 = dt - dt1;
			    noviX = this.x + dt1/1000 * this.vx + dt2/1000 * (-1) * this.vx;
			    this.vx *= -1;
			    this.faza = 2;
			    this.faza2vrijeme = performance.now();  //  vrijeme pocetka faze2
		    }
		    this.x = noviX;
		    this.y +=  this.vy * dt/1000;
	    } else if (this.faza == 2) { //faza letenja od trenutka udara igraca u zid
			if (this.y > visina + 200) {
				dodajStilove(this.el, {display: "none"});
				dodajStilove(this.sprite, {top: "16%", left: "0%", zIndex: "6"});
				this.vidljivSw = false;
				return false;
			}
			
			var vrijeme = performance.now();
			
			var dt = vrijeme - this.time;
			this.time = vrijeme;
			
			
			this.x +=  this.vx * dt/1000;
			this.y = this.y + this.vy*dt/1000 + this.g/2 * (dt/1000)**2;
		    this.vy = this.vy + this.g * dt / 1000;

		} 

		dodajStilove(this.el, {left: (this.x - this.sirina/2) + "px", bottom: visina - (this.y + this.visina/2) + "px"});
		return true;
		  
	  } else {	// ovo je normalni rezim rada
		var vrijeme = performance.now();
		if (this.time === null) {
			var dt = 0;
			this.time = vrijeme;
			this.pocetnoVrijemeAnim = vrijeme;
			this.pocFrame = 0;
		} else {
			var dt = vrijeme - this.time;
			this.time = vrijeme;
		}
		
		if (this.smjerKretanja !== null) {
			if (this.smjerKretanja !== this.smjerKretanjaPrethodni) {
			    this.smjerKretanjaPrethodni = this.smjerKretanja;
		    }
			
		    var noviX = this.x;
		    if (this.smjerKretanja === "l") {
				if (this.stranaPucaljke !== "l") {
					this.stranaPucaljke = "l";
					dodajStilove(this.pucaljka, {right: null, left: 0.2*this.sirina + "px"});
				}
			    noviX -= this.brzinaKretanja * dt / 1000; 
			    this.frame = Math.round(this.pocFrame + (this.time - this.pocetnoVrijemeAnim) / 1000 * this.vFrame) % 8;
			    if (noviX < this.sirina/2) noviX = this.sirina/2;
			    
			    if (this.x !== noviX) {
					this.x = noviX;
			        dodajStilove(this.el, {left: (this.x - this.sirina/2) + "px"});
			        dodajStilove(this.sprite, {top: -2*Math.floor(this.frame/3)*100 - 600 + 16 + "%", left: -2*(this.frame%3)*100 - 7 + "%"});
				}
			 
		    } else if (this.smjerKretanja === "d") {
				if (this.stranaPucaljke !== "d") {
					this.stranaPucaljke = "d";
					dodajStilove(this.pucaljka, {left: null, right: 0.2*this.sirina + "px"});
				}
			    noviX += this.brzinaKretanja * dt / 1000;
			    this.frame = Math.round(this.pocFrame + (this.time - this.pocetnoVrijemeAnim) / 1000 * this.vFrame) % 8;
			    if (noviX > sirina - this.sirina/2)  noviX = sirina - this.sirina/2;
			    
			    if (this.x !== noviX) {
					this.x = noviX;
			        dodajStilove(this.el, {left: (this.x - this.sirina/2) + "px"});
			        dodajStilove(this.sprite, {top: -2*Math.floor(this.frame/3)*100 + 16 + "%", left: -2*(this.frame%3)*100 + 7 + "%"});
				}   
		    }
	    } else {  // this.smjerKretanja == null, resetiramo pocetno vrijeme animacije
			this.pocetnoVrijemeAnim = vrijeme;
			this.pocFrame = this.frame;
			if (this.smjerKretanjaPrethodni === "l") {
			    dodajStilove(this.sprite, {top: -1200 + 16 + "%", left: "8%"});
			} else {
				dodajStilove(this.sprite, {top: -1200 + 16 + "%", left: "-208%"});
			}
		}
	  }  
	}
}

class Lopta {
	// konstruktor lopte. size je velicina lopte 1-4, vx/vy su komponente brzina, x/y su koordinate pocetne pozicije lopte
	// g je opcijski parametar gravitacije, a hMax je max. visina loptice, ona efektivno zadaje energiju lopte, znaci od donjeg brida/poda do donje strane loptice u njezinoj najvisoj poziciji
	// za inicSw inicijaliziramo loptu sa vrha displaya, za false je samo postavljamo na ekran. xPoc kod inicijalizacije zadaje x koordinatu lopte
	// ucinak opcija za 0 proizvodi klasicnu standardnu loptu, za 1 proizvodi treperujucu loptu koja kod ponistanje pauzira igru na odredeno vrijeme.
	// ucinak za 2/3 prozivodi loptu sa satom/zvijezdom. njihovim ponistenjem igrac dobija vremenski bonus i bonus unistenja svih lopti na ekranu
	// sesterokutSw za true proizvodi sesterokutnu loptu, za false obicnu
	constructor({size, vx, vy, hMax, x, y, g=700, xPoc, inicSw=false, ucinak=0, sesterokutSw=false}) {
		this.size = size;
		
		this.vx = vx;
		this.vy = vy;
		this.g = g;
		this.ucinak = ucinak;
		this.sesterokutSw = sesterokutSw;
		
		this.time = null; //performance.now();
		this.pocetnoVrijeme = performance.now();
		
		this.radius = this.vratiRadius(this.size);
		
		this.inicSw = inicSw;
		this.inicBr = 0;
		if (this.inicSw) {
		    this.x = xPoc;
		    if (this.sesterokutSw)  this.y = y;
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
		}
		
		
		
		this.newId = idGen();
		
		this.el = document.createElement("div");			
		this.id = "id" + this.newId;
		this.el.id = this.id;
		
		if (inicSw) {
			this.boja = "#a60303";
		} else {
			this.boja = "red";
		}
		dodajStilove(this.el, {height: 2*this.radius + "px", width: 2*this.radius + "px", borderRadius: "50%", backgroundColor: this.boja, position: "absolute",
			                  top: (this.y - this.radius) + "px", left: (this.x - this.radius) + "px", zIndex: "6"});
	    
	    if (this.sesterokutSw) {
			this.el1 = document.createElement("div");
			dodajStilove(this.el1, {backgroundImage: "url('sesterokut3.svg')", backgroundRepeat: "no-repeat", backgroundSize: "contain", position: "absolute", top: "0px", left: "0px", height: "100%", width: "100%"});
			this.el.appendChild(this.el1);
			
			this.el2 = document.createElement("div");
			dodajStilove(this.el2, {backgroundImage: "url('sesterokut2.svg')", backgroundRepeat: "no-repeat", backgroundSize: "contain", position: "absolute", top: "0px", left: "0px", height: "100%", width: "100%"});
			this.el.appendChild(this.el2);
			
			this.el3 = document.createElement("div");
			dodajStilove(this.el3, {backgroundImage: "url('sesterokut1a.svg')", backgroundRepeat: "no-repeat", backgroundSize: "contain", position: "absolute", top: "0px", left: "0px", height: "100%", width: "100%"});
			this.el.appendChild(this.el3);
			
			if (inicSw) {
			    dodajStilove(this.el1, {display: "none"});
			    dodajStilove(this.el2, {display: "block"});	
			    dodajStilove(this.el3, {display: "none"});	
			} else {
				dodajStilove(this.el1, {display: "block"});
			    dodajStilove(this.el2, {display: "none"});
			    dodajStilove(this.el3, {display: "none"});	
			}
			
			dodajStilove(this.el, {backgroundColor: null, transform: "rotate(" + this.vratiKut() + "deg)"});
		} else if (this.ucinak > 1) {
			this.el1 = document.createElement("div");
			dodajStilove(this.el1, {backgroundImage: "url('kuglaSat.svg')", backgroundRepeat: "no-repeat", backgroundSize: "contain", position: "absolute", top: "0px", left: "0px", height: "100%", width: "100%"});
			this.el.appendChild(this.el1);
			
			this.el2 = document.createElement("div");
			dodajStilove(this.el2, {backgroundImage: "url('kuglaZvijezda.svg')", backgroundRepeat: "no-repeat", backgroundSize: "contain", position: "absolute", top: "0px", left: "0px", height: "100%", width: "100%"});
			this.el.appendChild(this.el2);
			if (this.ucinak === 2) {
				dodajStilove(this.el1, {display: "block"});
			    dodajStilove(this.el2, {display: "none"});
			} else {
				dodajStilove(this.el1, {display: "none"});
			    dodajStilove(this.el2, {display: "block"});
			}
		}
	    
	    
	    
		document.querySelector(".display").appendChild(this.el);
		
		this.nacrtaj = this.nacrtaj.bind(this);
		this.interakcijaOruzje= this.interakcijaOruzje.bind(this);
		this.interakcijaIgrac = this.interakcijaIgrac.bind(this);
		this.reduciraj = this.reduciraj.bind(this);
		this.vratiPoziciju = this.vratiPoziciju.bind(this);
		this.inicijalizacijskaFaza = this.inicijalizacijskaFaza.bind(this);
		this.vratiKut = this.vratiKut.bind(this);
		this.switchaj = this.switchaj.bind(this);
		this.unisti = this.unisti.bind(this);
	}
	
	vratiRadius(velicina) {
		switch (velicina) {
			case (1):
			    return Math.floor(visina / 10);
			    break;
			case (2):
			    return Math.floor(visina / 15);
			    break;
			case (3):
			    return Math.floor(visina / 30);
			    break;
			case (4):
			    return Math.floor(visina / 60);
			    break;    
			default: 
			    alert("ilegalna velicina kuglice");
			    return 20;
		}
	}
	
	vratiKut() {
		if (this.sesterokutSw) {			
			return  (  Math.floor( (performance.now() - this.pocetnoVrijeme)/1000 * 360) % 360 );
		} else {
			return 0;
		}
	}
	
	inicijalizacijskaFaza() {
		var yPozicije = [[-1*this.radius, -0.5*this.radius, 0*this.radius, 0.5*this.radius, this.radius+1],[],[],[]];
		this.y = yPozicije[0][this.inicBr];
		if (pauzaSw[0]) {
			setTimeout(() => {this.inicijalizacijskaFaza()}, 1500);
			return true;
		}
		this.inicBr++;
		if (this.inicBr >= 5) {
			this.inicSw = false;
			this.hMax1 = visina - this.y - this.radius  +  (this.vy)**2 / 2 / this.g; 
		} else {
			setTimeout(() => {this.inicijalizacijskaFaza()}, 1500);
		}
	}
	
	vratiPoziciju() {
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
    
    unisti() {
		document.querySelector(".display").removeChild(this.el);
	}
    
    reduciraj() {
		let rez = []; let l = null;
		if (this.ucinak > 1) {
			document.querySelector(".display").removeChild(this.el);
			return rez;
		}
		
		switch (this.size) {
			case (1):
			    var nvx = this.vratiRadius(2);
	            l = new Lopta({size:2, vx:-1*Math.abs(this.vx), vy: this.sesterokutSw ? -1*Math.abs(this.vy) : pocetnaVy, hMax:visMax2, x:this.x-this.radius/2 - nvx < 0 ? nvx : this.x-this.radius/2, y:this.y, g:this.g, sesterokutSw:this.sesterokutSw});
	            rez.push(l);
	            l = new Lopta({size:2, vx:Math.abs(this.vx), vy: this.sesterokutSw ? -1*Math.abs(this.vy) : pocetnaVy, hMax:visMax2, x:this.x+this.radius/2 + nvx > sirina ? sirina-nvx : this.x+this.radius/2, y:this.y, g:this.g, sesterokutSw:this.sesterokutSw});
			    rez.push(l);
			    break;
			case (2):
			    var nvx = this.vratiRadius(3);
			    l = new Lopta({size:3, vx:-1*Math.abs(this.vx), vy: this.sesterokutSw ? -1*Math.abs(this.vy) : pocetnaVy, hMax:visMax3, x:this.x-this.radius/2 - nvx < 0 ? nvx : this.x-this.radius/2, y:this.y, g:this.g, sesterokutSw:this.sesterokutSw});
	            rez.push(l);
	            l = new Lopta({size:3, vx:Math.abs(this.vx), vy: this.sesterokutSw ? -1*Math.abs(this.vy) : pocetnaVy, hMax:visMax3, x:this.x+this.radius/2 + nvx > sirina ? sirina-nvx : this.x+this.radius/2, y:this.y, g:this.g, sesterokutSw:this.sesterokutSw});
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
				var nvx = this.vratiRadius(4);
			    l = new Lopta({size:4, vx:-1*Math.abs(this.vx), vy: this.sesterokutSw ? -1*Math.abs(this.vy) : pocetnaVy, hMax:visMax4, x:this.x-this.radius/2 - nvx < 0 ? nvx : this.x-this.radius/2, y:this.y, g:this.g, ucinak: ucinci[0], sesterokutSw:this.sesterokutSw});
	            rez.push(l);
	            l = new Lopta({size:4, vx:Math.abs(this.vx), vy: this.sesterokutSw ? -1*Math.abs(this.vy) : pocetnaVy, hMax:visMax4, x:this.x+this.radius/2 + nvx > sirina ? sirina-nvx : this.x+this.radius/2, y:this.y, g:this.g, ucinak: ucinci[1], sesterokutSw:this.sesterokutSw});
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
		dodajStilove(this.el, {top: (this.y-this.radius) + "px", left: (this.x-this.radius) + "px", display: disp, transform: "rotate(" + this.vratiKut() + "deg)"});  
	  } else {	
		var vrijeme = performance.now();
		if (this.time === null) {
			var dt = 0;
			this.time = vrijeme;
		} else {
			var dt = vrijeme - this.time;
			this.time = vrijeme;
		}
		
		if (pauzaSw[0])  dt = 0;
		
		var noviX = this.x + this.vx * dt/1000;
		
		
		if (noviX - this.radius < 0) {
			let dt1 = -1 * (this.radius - noviX) / this.vx * 1000;
			let dt2 = dt - dt1;
			
			noviX = this.x + dt1/1000 * this.vx + dt2/1000 * (-1) * this.vx;
			this.vx *= -1;
		} else if (noviX + this.radius > sirina) {
			let dt1 = (noviX + this.radius - sirina) / this.vx * 1000;
			let dt2 = dt - dt1;
			noviX = this.x + dt1/1000 * this.vx + dt2/1000 * (-1) * this.vx;
			this.vx *= -1;
		}
		
		var noviY = this.y + this.vy * dt/1000;
		
		if (this.sesterokutSw) {
		    if (noviY - this.radius < 0) {
			    let dt1 = -1 * (this.radius - noviY) / this.vy * 1000;
			    let dt2 = dt - dt1;
			
			    noviY = this.y + dt1/1000 * this.vy + dt2/1000 * (-1) * this.vy;
			    this.vy *= -1;
		    } else if (noviY + this.radius > visina) {
			    let dt1 = (noviY + this.radius - visina) / this.vy * 1000;
			    let dt2 = dt - dt1;
			    noviY = this.y + dt1/1000 * this.vy + dt2/1000 * (-1) * this.vy;
			    this.vy *= -1;
		    }
	    } else {
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
				    this.switchaj();
			    }
			
		    }	
		}  //  if sesterokutSw petlja
		
		if (noviX >= this.radius && noviX <= sirina - this.radius)  this.x = noviX;
		if (noviY >= this.radius && noviY <= visina - this.radius)  this.y = noviY;
		
		if (this.sesterokutSw) {
			this.boja = null;
			dodajStilove(this.el2, {display: "none"});
			if (this.ucinak === 1  &&  Math.floor( (this.time - this.pocetnoVrijeme) / 100) % 2 == 1  ) {
				dodajStilove(this.el1, {display: "none"});	
			    dodajStilove(this.el3, {display: "block"});	
			} else {
			    dodajStilove(this.el1, {display: "block"});	
			    dodajStilove(this.el3, {display: "none"});	
			}
		} else {
			if (this.ucinak === 1  &&  Math.floor( (this.time - this.pocetnoVrijeme) / 100) % 2 == 1  ) {
			    this.boja = "#f7cdcd";
		    } else {
			    this.boja = "red";
		    } 
		}
		
		if (this.ucinak > 1)  this.boja = null;
		
		dodajStilove(this.el, {top: (this.y-this.radius) + "px", left: (this.x-this.radius) + "px", backgroundColor: this.boja, 
			                   display: disp, transform: "rotate(" + this.vratiKut() + "deg)"});
	  }	
	}
	
	switchaj() {  // ova metoda switcha loptu sa satom za loptu sa bonus-anhilacijom i obrnuto. Status obicne lopte ne mijenja
	    if (this.ucinak === 2) {
			this.ucinak = 3;
			dodajStilove(this.el1, {display: "none"});
			dodajStilove(this.el2, {display: "block"});
		} else if (this.ucinak === 3) {
			this.ucinak = 2;
			dodajStilove(this.el1, {display: "block"});
			dodajStilove(this.el2, {display: "none"});
		}	
	}
    
}

class Kontrole {
	constructor({igracObjekt, oruzjeObjekt, engine}) {
		
		this.keyDown = false;
		this.igracObjekt = igracObjekt;
		this.oruzjeObjekt = oruzjeObjekt;
		this.engine = engine;
		
		document.addEventListener("keydown", (e) => {this.pritisakGumba(e)});
        document.addEventListener("keyup", (e) => {this.pritisakGumbaUp(e)});
                
        this.pritisakGumba = this.pritisakGumba.bind(this);
		this.pritisakGumbaUp = this.pritisakGumbaUp.bind(this);
	}
	
	pritisakGumba(ev) {	
		ev.preventDefault();
		if (this.engine.engineAktivanSw) {
			switch (ev.code) {
				case ("ArrowLeft"):
				    if (this.keyDown !== "ArrowLeft") {
				        this.keyDown = "ArrowLeft";
				        this.igracObjekt.smjerKretanja = "l";
				    }
				    break;
				case ("ArrowRight"):
				    if (this.keyDown !== "ArrowRight") {
				        this.keyDown = "ArrowRight";
				        this.igracObjekt.smjerKretanja = "d";
				    }
				    break;	
			}
		
		    if (ev.code === "KeyS") {
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
		
		    if (ev.code === "KeyA") {
			    anhilirajSveLopte(this.engine.poljeLopti, this.engine.poljeEksplozija, this.engine.zvukBang);
		    }
		}
		
	}
	
	pritisakGumbaUp(ev) {	
	    switch (ev.code) {
			case ("ArrowLeft"):
			    if (this.keyDown == "ArrowLeft") {
				    this.keyDown = false;
				    this.igracObjekt.smjerKretanja = null;
			    }
				break;
			case ("ArrowRight"):
			    if (this.keyDown == "ArrowRight") {
				    this.keyDown = false;
				    this.igracObjekt.smjerKretanja = null;
			    }
				break;	
		}
    }
}

export class Pauza {
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

function obrisiElemente(polje) {
	for (let i = polje.length-1; i > -1; i--) {
		polje[i].unisti();
		polje.splice(i, 1);
	}
}
