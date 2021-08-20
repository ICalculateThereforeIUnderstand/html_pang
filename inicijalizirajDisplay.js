const bojaCigle = "blue";
const bojaCementa = "#444444";
const bojaDisplaya = "#555555";


function inicijalizirajDisplay(visina, sirina, sirinaOkvira) {
	// za zadane visinu i sirinu displaya, generira display sa ciglastom ogradom sirine sirinaokvira.
	// display ce imati class="display"
	let root = document.querySelector("#root");
	let el = document.createElement("div");
	dodajStilove(el, {height: (visina+sirinaOkvira*2)+"px", width: (sirina+sirinaOkvira*2)+"px", backgroundColor:"red",
		              position: "relative", margin: "0px auto 0px auto"});
	
	
	let el1 = document.createElement("div");
	dodajStilove(el1, {height: sirinaOkvira+"px", width: "100%", backgroundColor: bojaCementa,
		              position: "absolute", top: "0px", left: "0px"});
		              
    let ela = document.createElement("div");
    dodajStilove(ela, {height: "50%", width: "100%", display: "flex", overflow: "hidden",
		               alignItems: "center", justifyContent: "space-between"});
	let elb = document.createElement("div");	              
	dodajStilove(elb, {height: "50%", width: "100%", display: "flex", overflow: "hidden",
		               alignItems: "center", justifyContent: "space-between"});
	
	napuniCigle(ela, 24, sirina+sirinaOkvira);
	napuniCigle(elb, 48, sirina+sirinaOkvira);
	el1.appendChild(ela);	 
	el1.appendChild(elb);	 	 
	el.appendChild(el1);
	
	
	
	let el2 = document.createElement("div");
	dodajStilove(el2, {height: sirinaOkvira+"px", width: "100%", backgroundColor: bojaCementa,
		              position: "absolute", bottom: "0px", left: "0px"});
		              
	ela = document.createElement("div");
    dodajStilove(ela, {height: "50%", width: "100%", display: "flex", overflow: "hidden",
		               alignItems: "center", justifyContent: "space-between"});
	elb = document.createElement("div");	              
	dodajStilove(elb, {height: "50%", width: "100%", display: "flex", overflow: "hidden",
		               alignItems: "center", justifyContent: "space-between"});
		               
	napuniCigle(ela, 24, sirina+sirinaOkvira);
	napuniCigle(elb, 48, sirina+sirinaOkvira);	                              	              	              
	el2.appendChild(ela);	 
	el2.appendChild(elb);		                            
	el.appendChild(el2);
	
	
	
	let el3 = document.createElement("div");
	dodajStilove(el3, {height: visina+"px", width: sirinaOkvira + "px", backgroundColor:"pink",
		              position: "absolute", top: sirinaOkvira + "px", left: "0px", overflow: "hidden"});
    for (let i = 0; i < 24; i++) {
	    el3.appendChild(setCigla(sirinaOkvira));  	
	}              
                  
	el.appendChild(el3);
	
	
	let el4 = document.createElement("div");
	dodajStilove(el4, {height: visina+"px", width: sirinaOkvira + "px", backgroundColor:"pink",
		              position: "absolute", top: sirinaOkvira + "px", right: "0px", overflow: "hidden"});
    for (let i = 0; i < 24; i++) {
	    el4.appendChild(setCigla(sirinaOkvira));  	
	}              
                  
	el.appendChild(el4);
	
	let el5 = document.createElement("div");
	el5.classList.add("display");
	dodajStilove(el5, {height: visina+"px", width: sirina + "px", backgroundColor: bojaDisplaya,
		              position: "absolute", top: sirinaOkvira + "px", left: sirinaOkvira + "px"});
		              
    let el6 = document.createElement("div");
    el6.id = "poruka";
    dodajStilove(el6, {height: "100px", width: "200px", position: "absolute", top: "250px", left: "350px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "9", display: "none"});
    let el7 = document.createElement("p");
    el7.id = "poruka-tekst";
    dodajStilove(el7, {fontFamily: "sans-serif", fontSize: "30px", fontWidth: "600", color: "#36eb1e"});
    el7.innerHTML = "Last 1s.";
    el6.appendChild(el7);
    
    el5.appendChild(el6);  // message window stavljamo na display
    
    let el8 = document.createElement("div");
    el8.id = "poruka1";
    dodajStilove(el8, {height: "100px", width: "400px", position: "absolute", top: "250px", left: "250px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "9"});
    let el9 = document.createElement("p");
    dodajStilove(el9, {fontFamily: "sans-serif", fontSize: "40px", fontWidth: "600", color: "#11d6f0"});
    el9.id = "poruka1-tekst";
    el9.innerHTML = "CLICK TO START";
    el8.appendChild(el9);
    
    el5.appendChild(el8);  // message window stavljamo na display
         
	el.appendChild(el5);  //  display stavljamo na ekran
	
	root.appendChild(el);
	
	let indikatori = document.createElement("div");
	indikatori.id = "indikatori";
	dodajStilove(indikatori, {height: "200px", width: (sirina + 2*sirinaOkvira) + "px", margin: "0px auto 0px auto"});
	root.appendChild(indikatori);
}

function setCigla(visina) {
	let el = document.createElement("div");
	dodajStilove(el, {height: visina+"px", width: "100%", backgroundColor: bojaCementa});
	
	let ela = document.createElement("div");
	dodajStilove(ela, {height: "50%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center"});
	
	let elc = document.createElement("div");
	dodajStilove(elc, {height: "80%", width: "80%", backgroundColor: bojaCigle, borderRadius: "3px"});
	ela.appendChild(elc);
	
	let elb = document.createElement("div");
	dodajStilove(elb, {height: "50%", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between"});
	
	for (let i = 0; i < 2; i++) {
		let elc = document.createElement("div");
	    dodajStilove(elc, {height: "90%", width: "45%", backgroundColor: bojaCigle, borderRadius: "3px"});
	    elb.appendChild(elc);
	}
	
	el.appendChild(ela);
	el.appendChild(elb);
	return el;
}

function napuniCigle(el, br, sirina){
	for (let i = 0; i < br; i++) {
		let elc = document.createElement("div");
		if (i == 0 || i == br-1) {
            dodajStilove(elc, {height: "70%", width: (sirina/br/2) + "px", backgroundColor: bojaCigle, borderRadius: "3px"});
        } else {
			dodajStilove(elc, {height: "70%", width: (sirina/br) + "px", backgroundColor: bojaCigle, borderRadius: "3px"});
		}
        el.appendChild(elc);
	}
}

function dodajStilove(el, stilovi) {
	for (let key in stilovi) {
		el.style[key] = stilovi[key];
	}
}

export default inicijalizirajDisplay;
