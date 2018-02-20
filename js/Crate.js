// Obiekt zawierajacy wszystkie instancje obiektu skrzyni.
Crate.crates = {};
// Pomocnicze zliczanie skrzyń z planszy.
Crate.count = 0;

// Pobierz id skrzyni według x i y. 
Crate.getCrateByXY = function (x, y) {
    for (var c in Crate.crates) {
        var cr = Crate.crates[c];
        if (cr.x === x && cr.y === y) {
            return cr.id;
        }
    }
    return -1;
};

function Crate(x, y) {
    Crate.count += 1;
    this.id = Crate.count;
	Crate.crates[this.id] = this;
    this.x = x;
    this.y = y;
    // Pozycja w animacji.
    this.ax = this.x;
    this.ay = this.y;
    
    // Nowa pozycja.
    this.nx = this.x;
    this.ny = this.y;
    
    // Zmienna sprawdzająaca, czy można przesunąć daną skrzynię.
    // Jest ona aktualizowana w zależności od kontekstu na planszy.
    // Aktualizacja odbywa się w klasie Player.
    this.canMove = true;
    
    // Stan skrzyni.
    this.state = 'active';
	this.states = {
		'active':{sx:16, sy:48},
		'inactive':{sx:32, sy:48}
	};
}

// Rysowanie skrzyni.
Crate.prototype.draw = function () {
    
    // Obliczanie nowej pozycji na ekranie.
    // Nie było potrzeby tworzenia osobnej metody update.
    if(this.canMove) {
        this.ax = VAR.easeInOutSine(this.ax, this.nx, VAR.t, VAR.d);
        this.ay = VAR.easeInOutSine(this.ay, this.ny, VAR.t, VAR.d);
    }
    
    Game.ctx.drawImage(
        Game.spr,
        // x zmienia się poprzez dodanie aktualnej klatki
        // oraz pomnożenie przez szerokość klatki
        // ze względu na to, jaki stan jest aktualny
        this.states[this.state].sx,
        this.states[this.state].sy,
        VAR.fsize,
        VAR.fsize,
        this.ax * VAR.fsize * VAR.scale,
        this.ay * VAR.fsize * VAR.scale,
        VAR.fsize * VAR.scale,
        VAR.fsize * VAR.scale
    );
};
