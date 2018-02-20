function showUiDelay(id) {
    setTimeout(function () {
        var ui = document.getElementById(id);
        ui.style.display = 'block';
    }, VAR.delay);
}

function hideUiDelay(id) {
    setTimeout(function () {
        var ui = document.getElementById(id);
        ui.style.display = 'none';
    }, VAR.delay);
}

function showUi(id) {
    var ui = document.getElementById(id);
    ui.style.display = 'block';
}

function hideUi(id) {
    var ui = document.getElementById(id);
    ui.style.display = 'none';
}
