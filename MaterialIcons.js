.pragma library

var _theme = "black";

function themeIcon(name, theme) {
    return "qrc:///material-icons/" + color + "/" + theme + "/" + name + ".png";
}

function lightIcon(name) { return themeIcon(name, "black"); }
function darkIcon(name) { return themeIcon(name, "light"); }
function icon(name) { themeIcon(name, _theme); }

function setLightTheme() { _theme = "black"; }
function setDarkTheme() { _theme = "white"; }