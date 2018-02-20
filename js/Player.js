// Zliczanie pchnięć skrzyni.
Player.pushes = 0;

function Player() {
    // Pobieramy pozycję gracza z planszy.
    this.x = Game.board.px;
	this.y = Game.board.py;
    // Pozycja do animowania postaci.
    this.ax = this.x;
    this.ay = this.y;
    // Aktualna klatka w obrębie frames
    // czyli        [1,0,2,0]
    // odpowiednio  [0,1,2,3] 
    this.current_f = 0;
    // Ile maksymalnie klatek ma minąć od momentu zmiany bieżącej klatki.
    this.f_max_delay = 5;
    // Aktualny delay klatki.
    this.change_f_delay = 0;
    // Stan początkowy.
    this.state = 'down';
	// Stany gracza.
    this.states = {
        // 'stan': {startX, startY, klatki[bez 'go' jest tylko jedna]}
        'down': {sx: 0, sy: 0, f: [0]},
        'down_go': {sx: 0, sy: 0, f: [1, 0, 2, 0]},
		'up': {sx: 0, sy: 16, f: [0]},
        'up_go': {sx: 0, sy: 16, f: [1, 0, 2, 0]},
        'right': {sx: 0, sy: 32, f: [0]},
        'right_go': {sx: 0, sy: 32, f: [1, 0, 2, 0]},
        'left': {sx: 0, sy: 32, f: [0], flip: true},
        'left_go': {sx: 0, sy: 32, f:  [1, 0, 2, 0], flip: true},
        'down_push': {sx: 48, sy: 0, f: [0, 1, 2, 1]},
        'up_push': {sx: 48, sy: 16, f: [1, 0, 2, 0]},
        'right_push': {sx: 48, sy: 32, f: [1, 0, 2, 0]},
        'left_push': {sx: 48, sy: 32, f: [1, 0, 2, 0], flip: true}
    };
}

Player.prototype.draw = function () {
    
    // Odwracanie.
    if (this.states[this.state].flip) {
        // zapisanie ustawień
        Game.ctx.save();
        // zmiana skali X na ujemną odwraca canvas w poziomie
        Game.ctx.scale(-1, 1);
    }
    
    // Rysowanie klatek postaci.
    // Używane są tu współrzędne (ax, ay), a nie (x, y).
    Game.ctx.drawImage(
        Game.spr,
        // x zmienia się poprzez dodanie aktualnej klatki
        // oraz pomnożenie przez szerokość klatki
        // ze względu na to, jaki stan jest aktualny
        this.states[this.state].sx + this.states[this.state].f[this.current_f] * VAR.fsize,
        this.states[this.state].sy,
        VAR.fsize,
        VAR.fsize,
        // jeśli flip, to przesuń ją w lewo o wielkość klatki i pomnóż przez skalę
        this.states[this.state].flip ? (-VAR.fsize - this.ax * VAR.fsize) * VAR.scale
        : this.ax * VAR.fsize * VAR.scale,
        this.ay * VAR.fsize * VAR.scale,
        VAR.fsize * VAR.scale,
        VAR.fsize * VAR.scale
    );
    
    // Zmiana aktualnej klatki animacji.
    // wraz z opóźnieniem.
    if (this.change_f_delay < this.f_max_delay) {
        this.change_f_delay += 1;
    } else {
        // resetujemy aktualny delay
        this.change_f_delay = 0;
        // Jeśli bieżąca klatka + 1 jest większa równa długości tablicy z kolejnością klatek (f), 
        // to ustaw bieżącą klatkę na 0 (zacznij animację od początku).
        // W przeciwnym wypadku pokaż kolejną klatkę.
        this.current_f = this.current_f + 1 >= this.states[this.state].f.length ? 0 : this.current_f + 1;
    }
    
    // Ponowne odwrócenie.
    // Przywrócenie domyślnych ustawień kontekstu.
    if (this.states[this.state].flip) {
        Game.ctx.restore();
    }
};

// Metoda aktualizująca stan gracza i skrzyń.
Player.prototype.update = function () {
    
    // Wektor przesunięcia.
    this.dx = 0;
    this.dy = 0;
    
	this.tmp_state = this.state;
    
    if (!VAR.move) {
        
        if (Game.key_37 || Game.touch_left) {
            this.tmp_state = 'left_go';
            VAR.move = true;
            this.dx = -1;
        } else if (Game.key_38 || Game.touch_up) {
            this.tmp_state = 'up_go';
            VAR.move = true;
            this.dy = -1;
        } else if (Game.key_39 || Game.touch_right) {
            this.tmp_state = 'right_go';
            VAR.move = true;
            this.dx = 1;
        } else if (Game.key_40 || Game.touch_down) {
            this.tmp_state = 'down_go';
            VAR.move = true;
            this.dy = 1;
        }
        
    }
    
    // Nowa pozycja.
    this.nx = this.x + this.dx;
    this.ny = this.y + this.dy;
    
    // Zmienna służąca do sprawdzania, czy można wykonać ruch.
    this.canMove = true;
    
    // Jeśli na nowej pozycji gracza jest obiekt typu solid, to nie można iść.
    if (Game.board.b[this.ny][this.nx].type === 'solid') {
        this.canMove = false;
        VAR.move = false;
        // Nie można iść, więc zmieniamy stan na taki bez 'go'.
        if (this.state.slice(-2) === 'go') {
            this.tmp_state = this.state.slice(0, -3);
        }
    } else {
        // Obsługa przesuwania skrzyń.
        // Do zmiennej c_id pobieramy skrzynię znajdującą się na nowej pozycji gracza.
        var c_id = Crate.getCrateByXY(this.nx, this.ny);
        
        // Jeśli metoda getCrateByXY nie zwróci -1, 
        // czyli na danej pozycji jest skrzynia,
        // to przechodzimy dalej.
        if (c_id !== -1) {

            // Nowa pozycja skrzyni to nowa pozycja gracza powiększona o wektor przesunięcia.
            Crate.crates[c_id].nx = this.nx + this.dx;
            Crate.crates[c_id].ny = this.ny + this.dy;

            // Za każdym razem na początku zakładamy, że skrzynię można przesunąć.
            Crate.crates[c_id].canMove = true;

            // Jeśli na nowej pozycji skrzyni znajduje się ściana
            if (Game.board.b[Crate.crates[c_id].ny][Crate.crates[c_id].nx].type === 'solid') {
                Crate.crates[c_id].canMove = false;
                // lub inna skrzynia, to nie możemy tam przesunąć.
            } else if (Crate.getCrateByXY(Crate.crates[c_id].nx, Crate.crates[c_id].ny) !== -1) {
                Crate.crates[c_id].canMove = false;
            }
            // Jeśli nie można przesunąć skrzyni, to gracz też nie może się ruszyć.
            if (!Crate.crates[c_id].canMove) {
                this.canMove = false;
                VAR.move = false;
            } else {
                // Zmiana stanu gracza na push.
                if (this.tmp_state.slice(-2) === 'go') {
                    this.tmp_state = this.tmp_state.slice(0, -2);
                    this.tmp_state += 'push';
                }
                
                // Przypisanie skrzyni jej nowej pozycji.
                Crate.crates[c_id].x = Crate.crates[c_id].nx;
                Crate.crates[c_id].y = Crate.crates[c_id].ny;
                
                // Wykonano pchnięcie skrzyni, więc zwiększamy ich liczbę o 1.
                Player.pushes += 1;

                // Wygaszenie skrzyni, jeśli stoi na właściwym miejscu.
                if (Game.board.b[Crate.crates[c_id].ny][Crate.crates[c_id].nx].type === 'spot') {
                    
                    // Użycie opóźnienia.
                    setTimeout(function () {
                        Crate.crates[c_id].state = 'inactive';
                        
                        // Sprawdzamy, czy ukończono poziom.
                        if (Game.isLevelCompleted()) {
                            Game.playSoundDelay('good');
                            if (Game.isGameCompleted()) {
                                showUiDelay('winning-menu');
                                hideUiDelay('restart');
                            } else {
                                showUiDelay('ingame-menu');
                                hideUiDelay('restart');
                            }
                        }
                    }, VAR.delay);
                    
                }
            }

        }
    }
    
    // Jeżeli postać może się poruszyć.
    if (this.canMove) {
        // Jego pozycja to wyliczona wcześniej nowa pozycja.
        this.x = this.nx;
        this.y = this.ny;
        
        // Animowanie postaci.
        // Korzystamy tutaj z pomocy funkcji Easing,
        // która powoduje, że ruch postaci pomiędzy kafelkami jest płynny.
        switch (this.state) {
        case 'left_go':
            this.ax = VAR.easeInOutSine(this.ax, this.nx, VAR.t, VAR.d);
            //console.log(this.ax);
            if (this.ax <= this.nx && !VAR.move) {
                this.tmp_state = this.state.slice(0, -3);
            }
            break;
        case 'right_go':
            this.ax = VAR.easeInOutSine(this.ax, this.nx, VAR.t, VAR.d);
            //console.log(this.ax);
            if (this.ax >= this.nx && !VAR.move) {
                this.tmp_state = this.state.slice(0, -3);
            }
            break;
        case 'up_go':
            this.ay = VAR.easeInOutSine(this.ay, this.ny, VAR.t, VAR.d);
            //console.log(this.ay);
            if (this.ay <= this.ny && !VAR.move) {
                this.tmp_state = this.state.slice(0, -3);
            }
            break;
        case 'down_go':
            this.ay = VAR.easeInOutSine(this.ay, this.ny, VAR.t, VAR.d);
            //console.log(this.ay);
            if (this.ay >= this.ny && !VAR.move) {
                this.tmp_state = this.state.slice(0, -3);
            }
            break;
        case 'down_push':
            this.ay = VAR.easeInOutSine(this.ay, this.ny, VAR.t, VAR.d);
            //console.log(this.ay);
            if (this.ay >= this.ny && !VAR.move) {
                this.tmp_state = this.state.slice(0, -5);
            }
            break;
        case 'up_push':
            this.ay = VAR.easeInOutSine(this.ay, (this.ny - 0.2), VAR.t, VAR.d);
            if (this.ay <= (this.ny - 0.2) && !VAR.move) {
                this.tmp_state = this.state.slice(0, -5);
                this.ay += 0.2;
            }
            break;
        case 'right_push':
            this.ax = VAR.easeInOutSine(this.ax, this.nx, VAR.t, VAR.d);
            //console.log(this.ay);
            if (this.ax >= this.nx && !VAR.move) {
                this.tmp_state = this.state.slice(0, -5);
            }
            break;
        case 'left_push':
            this.ax = VAR.easeInOutSine(this.ax, this.nx, VAR.t, VAR.d);
            //console.log(this.ay);
            if (this.ax <= this.nx && !VAR.move) {
                this.tmp_state = this.state.slice(0, -5);
            }
            break;
        }
        
        // Zmiana bieżącej klatki na zerową.
        if (this.tmp_state !== this.state) {
            this.current_f = 0; // najważniejsze
            this.state = this.tmp_state;
        }
        
        // Odtwarzanie dźwięku przesuwania skrzyni.
        if (this.state.slice(-4) === 'push') {
            Game.playSound('swipe');
        }
    }

};
