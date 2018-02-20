// Inicjacja gry po załadowaniu całej strony.
window.onload = function () {
    // Tworzenie obiektu obrazu.
    Game.spr = new Image();
    
    // Wskazanie źródła obrazu.
    Game.spr.src = 'sprite.png';
};

// Pomocnicze zmienne i funkcje.
VAR = {
    fsize:  16, // Rozmiar pojedynczego kafelka.
	fps:    25, // Liczba klatek na sekundę.
	W:       0, // Szerokość okna.
	H:       0, // Wysokość okna.
	scale:   3, // Elementy gry są wklejane w odpowiedniej skali.
    delay: 600, // Opóźnienie (ms).
	//
	lastTime: 0,
    move: false,
    t: 0,        // Aktualny czas (przyrasta po każdym przejściu pętli głównej).
    d: 500,      // Czas trwania animacji (w milisekundach). Potrzebne do przekazania dla funkcji wygładzającej ruch.
	rand: function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
    easeInOutSine: function (start, end, t, d) {
        return Math.round((start + (-((1 / 2) * (Math.cos(Math.PI * t / d) - 1)) * (end - start))) * 100) / 100;
    }
};

// Obiekt zawierający bazowe funkcje związane z grą.
// Game nie ma konstruktora, jest jedynie obiektem grupującym funkcje.
Game = {
    start: function() {
        hideUi('main-menu');
        showUi('restart');
        Game.init();
    },
    
	// Funkcja init zostanie uruchomiona raz po załadowaniu strony.
	init: function () {
		// Tworzy canvas.
		Game.canvas = document.createElement('canvas');
        
        Game.uiCanvas = document.getElementById('userbar-canvas');
		// Przypisanie kontekstu 2D do zmiennej ctx, która jest właściwością obiektu Game.
		Game.ctx = Game.canvas.getContext('2d');
        
        Game.uiCtx = Game.uiCanvas.getContext('2d');
		
        // Czy gra ukończona? Zmienia wartość na true po przejściu wszystkich dostępnych plansz).
        Game.isComplete = false;
        
        // Tworzenie planszy.
		Game.board = new Board();
		
		Game.layout();
		// Metoda layout odpali się przy każdej zmianie wielkości okna.
		window.addEventListener('resize', Game.layout, false);
        
		// Dodanie płótna do DOM.
		document.body.appendChild(Game.canvas);
        
        // Nowy bohater.
		Game.player = new Player();
		
		// Nasłuchiwacze zdarzeń.
		window.addEventListener('keydown', Game.onKey, false);
		window.addEventListener('keyup', Game.onKey, false);
        
        // Dotykowe.
        Game.canvas.addEventListener('touchstart', Game.onTouch, false);
		Game.canvas.addEventListener('touchend', Game.onTouch, false);
		
		// Rozpoczęcie pętli gry.
		Game.animationLoop();
	},
	
    // Obsługa klawiatury.
	onKey: function (ev) {
		// Zabroń przeglądarce wykonywania domyślnie zdefiniowanych czynności.
        ev.preventDefault();
        
        if (ev.type === 'keydown' && !Game['key_' + ev.keyCode]) {
            switch (ev.keyCode) {
            case 37:
                Game['key_' + ev.keyCode] = true;
                break;
            case 38:
                Game['key_' + ev.keyCode] = true;
                break;
            case 39:
                Game['key_' + ev.keyCode] = true;
                break;
            case 40:
                Game['key_' + ev.keyCode] = true;
                break;
            }
        } else if (ev.type === 'keyup') {
            Game['key_' + ev.keyCode] = false;
        }
	},
    
    // Obsługa ekranu dotykowego.
    onTouch: function (ev) {
        ev.preventDefault();
        // Krawędzie ekranu, które są odjęte od współrzędnej dotknięcia w celu ustalenia, w którym
        // miejscu na Game.canvas zostało poczynione dotknięcie.
        var edgeX  = (window.innerWidth - Game.canvas.width) / 2,
            edgeY  = (window.innerHeight - Game.canvas.height),
            touchX = Math.floor((ev.changedTouches[0].clientX - edgeX) / VAR.fsize / VAR.scale),
            touchY = Math.floor((ev.changedTouches[0].clientY - edgeY) / VAR.fsize / VAR.scale);
        
        //console.log(touchX);
        //console.log(touchY);
        
        if (ev.type === 'touchstart') {
            if (touchX > Game.player.x && touchY === Game.player.y) {
                //console.log("RIGHT");
                Game.touch_right = true;
            } else if (touchX < Game.player.x && touchY === Game.player.y) {
                //console.log("LEFT");
                Game.touch_left = true;
            } else if (touchY < Game.player.y && touchX === Game.player.x) {
                //console.log("UP");
                Game.touch_up = true;
            } else if (touchY > Game.player.y && touchX === Game.player.x) {
                //console.log("DOWN");
                Game.touch_down = true;
            }
        } else if (ev.type === 'touchend') {
            // Zdarzenie touchend powoduje, że wszystko jest false.
            Game.touch_right = false;
            Game.touch_left = false;
            Game.touch_up = false;
            Game.touch_down = false;
        }
    },
    
    // Sprawdza, czy poziom został ukończony.
    isLevelCompleted: function () {
        // Pętla przechodzi po wszystkich skrzyniach.
        for (var c in Crate.crates) {
            // Jeśli chociaż jedna jest aktywna, to level nieukończony.
            if (Crate.crates[c].state === 'active') {
                return false;
            }
        }
        return true;
    },
    
    isGameCompleted: function () {
        if (Board.currentLevel === Board.levels.length - 1) {
            return true;
        }
        return false;
    },
    
    // Czyści wszystkie dane i ładuje nowy poziom.
    switchLevel: function () {
        Board.currentLevel += 1;
        Crate.crates = [];
        Player.pushes = 0;
        delete Game.board;
        Game.board = new Board();
        delete Game.player;
        Game.player = new Player();
    },
    
    clearGame: function () {
        Crate.crates = [];
        Player.pushes = 0;
        delete Game.board;
        delete Game.player;
        Board.currentLevel = 0;
        showUi('main-menu');
        Game.isComplete = true;
        document.body.removeChild(Game.canvas);
        delete Game.ctx;
//        document.getElementById('ui').removeChild(Game.uiCanvas);
//        delete Game.uiCtx;
    },
    
    restartLevel: function () {
        Crate.crates = [];
        Player.pushes = 0;
        delete Game.board;
        Game.board = new Board();
        delete Game.player;
        Game.player = new Player();
    },
    
    playSound: function (audio_id) {
        var sound = document.getElementById(audio_id);
        sound.play();
    },
    
    playSoundDelay: function (audio_id) {
        setTimeout(function () {
            var sound = document.getElementById(audio_id);
            sound.play();
        }, VAR.delay);
    },
	
	// Ta metoda będzie odpalana przy każdej zmianie wielkości okna.
	layout: function (ev) {
		// Dla łatwiejszego pisania wielkość okna zostaje przypisana do właściwości W i H obiektu VAR
		VAR.W = window.innerWidth;
		VAR.H = window.innerHeight;
        
        VAR.sW = (window.innerWidth) * 0.9;
		VAR.sH = (window.innerHeight) * 0.9;
		
		// OBLICZAMY SKALĘ (która musi być liczbą całkowitą, by uzyskać ostre piksele)
		// Wybieramy mniejszą liczbę spośród:
		//     Szerokość podzielona przez wysokość klatki pomnożona przez ilość kafelków
		//     Wysokość j.w.
		// dodajemy Math.max(1, ...), żeby zabezpieczyć przed skalą mniejszą niż 1
		VAR.scale = Math.max(1, Math.min(
			Math.floor(VAR.sW / (VAR.fsize * Game.board.b[0].length)), // ilość kolumn
			Math.floor(VAR.sH / (VAR.fsize * Game.board.b.length))     // ilość rzędów
		));
		
		// iloczyn obliczonej wcześniej skali i ilości kafelków
		Game.canvas.width = Math.round(VAR.scale * VAR.fsize * Game.board.b[0].length);
		Game.canvas.height = Math.round(VAR.scale * VAR.fsize * Game.board.b.length);
        
        Game.uiCanvas.width = Math.round(VAR.scale * VAR.fsize * Game.board.b[0].length);
		Game.uiCanvas.height = Math.max(32, Math.round(VAR.scale * VAR.fsize));
        
        // Wielkość czcionki.
        Game.uiCanvas.style.fontSize = (VAR.scale * (VAR.fsize) / 4) + 'px';
		
		// Wyśrodkowanie obszaru gry.
		Game.canvas.style.transform = 'translate(' + Math.round((VAR.W - Game.canvas.width) / 2) + 'px, ' + Math.round((VAR.H - Game.canvas.height)) + 'px)';
		Game.canvas.style['-webkit-transform'] = 'translate(' + Math.round((VAR.W - Game.canvas.width) / 2) + 'px, ' + Math.round((VAR.H - Game.canvas.height)) + 'px)';
		Game.canvas.style['-ms-transform'] = 'translate(' + Math.round((VAR.W - Game.canvas.width) / 2) + 'px, ' + Math.round((VAR.H - Game.canvas.height)) + 'px)';
        
        // Usunięcie rozmycia.
        Game.ctx.mozImageSmoothingEnabled = false;
        Game.ctx.oImageSmoothingEnabled = false;
        Game.ctx.msImageSmoothingEnabled = false;
        Game.ctx.imageSmoothingEnabled = false;
	},
    
	// Funkcja odpala się 60 razy na sekundę.
	animationLoop: function (time) {
        
        if (!Game.isComplete) {
            
            requestAnimationFrame(Game.animationLoop);
            // Ograniczenie do ilości klatek zdefiniowanych w właściwości obiektu VAR (nie więcej niż VAR.fps)
            if (time - VAR.lastTime >= 1000 / VAR.fps) {
                VAR.lastTime = time;
                //
                // Czyszczenie canvas w każdej klatce.
                Game.ctx.clearRect(0, 0, VAR.W, VAR.H);
                Game.uiCtx.clearRect(0, 0, VAR.W, VAR.H);

                // Przyrost czasu. W każdej klatce wzrasta o jej czas trwania (w milisekundach).
                if (VAR.move) {
                    VAR.t += 1000 / VAR.fps;
                }

                if (VAR.t >= VAR.d) {
                    // Wyzerowanie bieżącego czasu.
                    VAR.t = 0;
                    // Kończenie ruchu.
                    VAR.move = false;
                }

                // Rysowanie planszy.
                Game.board.draw();

                // Pętla for in, rysująca wszystko, co jest w obiekcie crates.
                for (var o in Crate.crates) {
                    // Dla każdego obiektu z crates wykonaj metodę draw().
                    Crate.crates[o].draw();
                }

                Game.player.update();

                // Rysowanie postaci.
                Game.player.draw();
                
                Game.uiCtx.font = "1em 'press_start_2pregular'";
                Game.uiCtx.fillStyle = 'white';
                Game.uiCtx.fillText('Pushes: ' + (Player.pushes), 10, 30);
            }
            
        } else {
            Game.uiCtx.clearRect(0, 0, VAR.W, VAR.H);
        }
		
	}
};