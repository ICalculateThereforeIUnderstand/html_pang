export class LeteciBroj {
	constructor({broj=0, sir, vis=sir/2, x=sir/2, y=vis/2, vy=200, vrijeme=1000}) {
		this.broj = broj;
		this.sirina = sir;
		this.visina = vis;
		this.x = x;
		this.pocY = y;
		this.y = this.pocY;
		this.vy = -1*vy;
		this.vrijeme = vrijeme;
		
		this.aktivnaSw = false;
		this.pocTime = null;
		
		this.el = document.createElement("div");
		dodajStilove(this.el, {height: this.visina + "px", width: this.sirina + "px", position: "absolute",
                               top: this.y - this.visina/2 + "px", left: this.x - this.sirina/2 + "px", 
                               zIndex: "8", display: "none", justifyContent: "center", 
                               alignItems: "center"});
        
        let el1 = document.createElement("p");
        dodajStilove(el1, {fontFamily: "sans-serif", fontSize: "15px", fontWidth: "800", color: "#4bf542"});
        el1.innerHTML = this.broj + "";
        this.el.appendChild(el1);
        
        document.querySelector(".display").appendChild(this.el);
        
        
        this.aktiviraj = this.aktiviraj.bind(this);
        this.nacrtaj = this.nacrtaj.bind(this);
    }
    
    aktiviraj() {
		if (!this.aktivnaSw) {
			this.aktivnaSw = true;
			this.pocTime = performance.now();
			dodajStilove(this.el, {display: "flex"});
		}
	}
	
	nacrtaj() {
		if (this.aktivnaSw) {
			let vri = performance.now();
			let dt =  vri - this.pocTime;
			if (dt > this.vrijeme) {
				this.aktivnaSw = false;
				document.querySelector(".display").removeChild(this.el);
				return false;
			} else {
				this.y = this.pocY + this.vy * dt / 1000;
				if (this.y - this.visina/2 <= 0) {
					this.pocY = this.visina/2;
					this.vy = 0;
				}
				dodajStilove(this.el, {top: this.y - this.visina/2 + "px"});
			}
			return true;
		}
		return false;
	}
}


export class Animacija {
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

export class Zvuk {
	constructor({file, brOverlap=1, volume=1, loop=false}) {
		this.count = 0;
		this.br = brOverlap;
		this.volume = this.logVolume(volume)/100;
		this.pokrenutoSw = false;
		 
		this.polje = []
		for (var i = 0; i < this.br; i++) {
			let a = new Audio(file);
			a.volume = this.volume;
			a.loop = loop;
            this.polje.push(a);
        }
        
        this.sviraj = this.sviraj.bind(this);
	}
	
	sviraj() {
		this.pokrenutoSw = true;
		this.polje[this.count].play();
		this.count = (this.count+1) % this.br;
	}
	
	logVolume(x) {
		if (x == 0) return 0;
		return Math.exp(5.116 * (x-0.1));
	}
	
}

function dodajStilove(el, stilovi) {
    for (let key in stilovi) {
	    el.style[key] = stilovi[key];
	}
}
