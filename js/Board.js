// ' ' - puste miejsce
// #   - ściana
// .   - podłoga
// C   - skrzynka
// X   - miejsce na skrzynkę
// P   - gracz

// Zmienna statyczna reprezentująca bieżący poziom.
Board.currentLevel = 0;

// Poziomy.
Board.levels = [
    [	// 1
		'  ##### ',
		'###...# ',
		'#.C...##',
		'#...C.X#',
		'#..C..X#',
		'##....X#',
		' #P..###',
		' #####  '
	],
	[	// 2
		'####    ',
		'#..#    ',
		'#..#####',
		'#......#',
		'##PX#C.#',
		'#...#..#',
		'#...####',
		'#####   '
	]
];

// elementy planszy
Board.elems = {
	// podłoga
	'.': {sx: 64, sy: 48, type: 'empty'},
	// ściana
	'#': {sx: 0, sy: 48, type: 'solid'},
	// pola, na które wstawia się skrzynki
	'X': {sx: 48, sy: 48, type: 'spot'},
	// pusty
	'none': {sx: 80, sy: 48, type: 'empty'}
};

// konstruktor
function Board() {
	// wczytujemy poziom
	this.init(Board.levels[Board.currentLevel]);
}

// Rysowanie planszy.
Board.prototype.draw = function () {
    for (var i=0; i<this.b.length; i++) {
        for (var j=0; j<this.b[i].length; j++) {
            Game.ctx.drawImage(
                Game.spr,
                this.b[i][j].sx,
                this.b[i][j].sy,
                VAR.fsize,
                VAR.fsize,
                j * VAR.fsize * VAR.scale, // tutaj iksy
                i * VAR.fsize * VAR.scale, // tutaj igreki
                VAR.fsize * VAR.scale,
                VAR.fsize * VAR.scale
            );
        }
    }
};

// ustawienie planszy
// Argumentem jest tablica, czyli plansza odpowiedniego poziomu
Board.prototype.init = function (arr) {
    // tworzymy tablicę, którą będziemy stopniowo wypełniać
    this.b = [];
    
    for (var i=0; i<arr.length; i++) {
        // za każdym razem wstawiamy do b nową pustą tablicę
        this.b.push([]); // czyli pusty rząd
        // j mniejsze w każdej iteracji od długości aktualnego stringa
        // lepiej tak niż na sztywno, gdybyśmy chcieli dać jakąś większą planszę
        for (var j=0; j<arr[i].length; j++) {
            // do nowej tablicy wstawiamy obiekt
            this.b[i].push(
                // wybrany łańcuch odpowiada identyfikatorowi danego obiektu
                // z tablicy Board.elems
                Board.elems[
                      arr[i].charAt(j) == ' ' ? 'none' 
                    : arr[i].charAt(j) == 'P' || arr[i].charAt(j) == 'C' ? '.'
                    : arr[i].charAt(j)
                ]
            );
            // Właściwości służące do narysowania gracza w miejscu 'P'.
			if (arr[i].charAt(j) == 'P') {
				this.px = j;
				this.py = i;
			}
            if (arr[i].charAt(j) == 'C') {
                new Crate(j, i);
            }
        }
    }
};