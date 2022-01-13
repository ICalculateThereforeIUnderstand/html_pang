
class Indikatori {
	constructor({brZivota=3, bodovi=0, level=1, progres=0, bojaPozadine="black", bojaSlova="#11d6f0"}) {  /*brZivota/bodovi/level zadaju brzivota, bodove i trenutni level. 
		progres postavlja progres traku, moze poprimiti vrijednosti 0-100 (postotci). koristi setter metode setLives, setBodovi,
		setLevel i setProgres*/
		this.lives = brZivota;
		this.bodovi = bodovi;
		this.level = level;
		this.progres = progres;
		this.padajuciElement = null;
		this.display = document.querySelector(".display");
		dodajStilove(this.display, {backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "cover"});
		
		var fontProperties = {fontFamily: "sans-serif", fontSize: "40px", fontWeight: "600", color: bojaSlova, lineHeight: "0"};
		
		this.el = document.createElement("div");	
		dodajStilove(this.el, {height: "100%", width: "100%", display: "flex"});
		
		var el1 = document.createElement("div");	
		dodajStilove(el1, {height: "100%", width: "33.33%", backgroundColor: bojaPozadine, display: "flex", alignItems: "center", flexDirection: "column"});
		
		var e = document.createElement("p");
		e.innerHTML = "Lives:"
		dodajStilove(e, fontProperties);
		el1.appendChild(e);
		
		this.indikatorLives = document.createElement("div");
		dodajStilove(this.indikatorLives, {height: "45%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center"});
		el1.appendChild(this.indikatorLives);
		
		var el2 = document.createElement("div");	
		dodajStilove(el2, {height: "100%", width: "33.33%", backgroundColor: bojaPozadine, display: "flex", alignItems: "center", flexDirection: "column"});
		
		this.indikatorLevel = document.createElement("p");
		this.indikatorLevel.innerHTML = "Level: " + this.level;
		dodajStilove(this.indikatorLevel, fontProperties);
		el2.appendChild(this.indikatorLevel);
		
		e = document.createElement("div");  //  bijeli okvir oko indikatora
		dodajStilove(e, {height: "35%", width: "90%", backgroundColor: "white", borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center"});
		var e1 = document.createElement("div"); // pozadina sa linearnim gradijentom boja
		dodajStilove(e1, {height: "80%", width: "95%", overflow: "hidden", position: "relative", background: "linear-gradient(to left, hsl(350, 70%, 66%) 0%, hsl(40, 70%, 46%) 20%, hsl(90, 70%, 46%) 40%, hsl(140, 70%, 46%) 60%, hsl(190, 70%, 46%) 80%, hsl(240, 70%, 46%) 100%)"});
		
		this.indikatorProgres = document.createElement("div");  //  crna podloga koja zaklanja linearni gradijent
		dodajStilove(this.indikatorProgres, {height: "100%", width: "100%", position: "absolute", top: "0px", left: "0%", backgroundColor: "black"});
		
		e1.appendChild(this.indikatorProgres);
		e.appendChild(e1);
		
		el2.appendChild(e);
		
		
		var el3 = document.createElement("div");	
		dodajStilove(el3, {height: "100%", width: "33.33%", backgroundColor: bojaPozadine, display: "flex", alignItems: "center", flexDirection: "column"});
		
		e = document.createElement("p");
		e.innerHTML = "Scores:"
		dodajStilove(e, fontProperties);
		el3.appendChild(e);
		
		this.indikatorBodovi = document.createElement("p");
		this.indikatorBodovi.innerHTML = this.bodovi;
		dodajStilove(this.indikatorBodovi, fontProperties);
		el3.appendChild(this.indikatorBodovi);
		
		
		this.el.appendChild(el1);
		this.el.appendChild(el2);
		this.el.appendChild(el3);
		
		document.querySelector("#indikatori").appendChild(this.el);      //  u ovu komponentu ubacujem u ovaj element. On mora imati zadanu visinu i sirinu, i onda ce to biti sirina i visina moje komponente.
		
		this.setLives = this.setLives.bind(this);
		this.setBodovi = this.setBodovi.bind(this);
		this.setLevel = this.setLevel.bind(this);
		this.setProgres = this.setProgres.bind(this);
		this.izgubioZivot = this.izgubioZivot.bind(this);
		this.setBackground = this.setBackground.bind(this);
		
		this.setLives(this.lives, true);
		this.setBodovi(this.bodovi, true);
		this.setProgres(this.progres, true);
		this.setLevel(this.level, true);
	}
	
	// sw je pomocna inicijalizacijska varijabla, van ove klase je nemoj nikada koristiti, i ako ti nije jasno cemu sluzi, nemoj je koristiti
	setProgres(progres=0, sw=false) {
		if (progres !== this.progres || sw) {
		    this.progres = progres;
		    dodajStilove(this.indikatorProgres, {left: this.progres + "%"});
	    }
	}
	
	setBackground(lev=1) {
		switch (lev%28) {
			case (1):
			case (2):
			    this.display.style.backgroundImage = 'url("./slike/zagreb.jpg")';
			    break;
			case (3):
			case (4):
			    this.display.style.backgroundImage = 'url("./slike/split.jpg")';
			    break;
			case (5):
			case (6):
			    this.display.style.backgroundImage = 'url("./slike/dubrovnik.jpg")';
			    break;
			case (7):
			case (8):
			    this.display.style.backgroundImage = 'url("./slike/pula.jpg")';
			    break;
			case (9):
			case (10):
			    this.display.style.backgroundImage = 'url("./slike/zadar.jpg")';
			    break;
			case (11):
			case (12):
			    this.display.style.backgroundImage = 'url("./slike/osijek.jpg")';
			    break;			
			case (13):
			case (14):
			    this.display.style.backgroundImage = 'url("./slike/trogir.jpg")';
			    break;			
			case (15):
			case (16):
			    this.display.style.backgroundImage = 'url("./slike/trogir.jpg")';
			    break;
			case (17):
			case (18):
			    this.display.style.backgroundImage = 'url("./slike/varazdin.jpg")';
			    break;
			case (19):
			case (20):
			    this.display.style.backgroundImage = 'url("./slike/plitvice.jpg")';
			    break;		
			case (21):
			case (22):
			    this.display.style.backgroundImage = 'url("./slike/trakoscan.jpg")';
			    break;			
			case (23):
			case (24):
			    this.display.style.backgroundImage = 'url("./slike/zagreb1.jpg")';
			    break;			
			case (25):
			case (26):
			    this.display.style.backgroundImage = 'url("./slike/trogir2.jpg")';
			    break;			
			case (27):
			case (0):
		}
	}
	
	setLevel(lev=1, sw=false) {
		if (lev !== this.level || sw) {
		    this.level = lev;
		    this.indikatorLevel.innerHTML = "Level: " + this.level;
	    }
	}
	
	setBodovi(br=0, sw=false) {
		if (br !== this.bodovi || sw) {
		    this.bodovi = br;
		    this.indikatorBodovi.innerHTML = this.bodovi;
	    }
	}
	
	izgubioZivot() {
		if (this.lives !== 0) {
			dodajStilove(this.padajuciElement, {transform: "rotateX(90deg)", transformOrigin: "50% 95% 0px"});
			setTimeout(()=>{this.setLives(this.lives-1); console.log("postavljen je novi display")}, 2000);
		}
	}
	
	setLives(br=3, sw=false) {
		if (br !== this.lives || sw) {
		    this.lives = br;
		
		    while (this.indikatorLives.firstChild) {
			    this.indikatorLives.removeChild(this.indikatorLives.firstChild);
		    }
		
		    if (this.lives <= 5) {
		        for (let i = 0; i < this.lives; i++) {
					if (i !== this.lives-1) {
			            let el = document.createElement("div");
			            dodajStilove(el, {height: "100%", width: 0.6666*this.indikatorLives.clientHeight +"px", position: "relative", overflow: "hidden"});
				        
				        
				        let spr = document.createElement("img"); 
				        el.appendChild(spr);
	                    dodajStilove(spr, {position: "absolute", height: "1600%", width: "600%",
			                                       top: "16%", left: "0%", zIndex: "10"});
	                    spr.setAttribute("src", "sprite.png");

			            this.indikatorLives.appendChild(el);
			        } else {
						this.padajuciElement = document.createElement("div");
						dodajStilove(this.padajuciElement, {height: "100%", width: 0.6666*this.indikatorLives.clientHeight +"px",
				                       transition: "transform 0.7s ease-in", position: "relative", overflow: "hidden"});
				                      
				        let spr = document.createElement("img"); 
				        this.padajuciElement.appendChild(spr);
	                    dodajStilove(spr, {position: "absolute", height: "1600%", width: "600%",
			                                       top: "16%", left: "0%", zIndex: "10"});
	                    spr.setAttribute("src", "sprite.png");
	                        
			            this.indikatorLives.appendChild(this.padajuciElement);
					}
		        } 
		    } else {
			    this.padajuciElement = document.createElement("div");
			    dodajStilove(this.padajuciElement, {height: "100%", width: 0.6666*this.indikatorLives.clientHeight +"px",
				                   transition: "transform 0.7s ease-in", overflow: "hidden", position: "relative"});
				
				let spr = document.createElement("img"); 
				this.padajuciElement.appendChild(spr); 
	            dodajStilove(spr, {position: "absolute", height: "1600%", width: "600%",
			                       top: "16%", left: "0%", zIndex: "10"});
	            spr.setAttribute("src", "sprite.png");
				
			    this.indikatorLives.appendChild(this.padajuciElement);
			    let el = document.createElement("p");
		        el.innerHTML = "X " + this.lives;
		        dodajStilove(el, {fontFamily: "sans-serif", fontSize: "40px", fontWeight: "600", color: "#11d6f0", lineHeight: "0"});
		        this.indikatorLives.appendChild(el);
		    }
	    }
	}
}

function dodajStilove(el, stilovi) {
    for (let key in stilovi) {
	    el.style[key] = stilovi[key];
	}
}

export default Indikatori;
