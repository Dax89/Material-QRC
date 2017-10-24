const fs = require("fs");
const fsextra = require("fs-extra");
const path = require("path");
const git = require("simple-git");

const REPO = "https://github.com/google/material-design-icons.git";
const IN_FOLDER_NAME = "material-icons";
const OUT_FOLDER_NAME = "../material-icons";

const SUPPORTED_ADPI = [ "drawable-mdpi", "drawable-xhdpi", 
                         "drawable-xxdpi", "drawable-xxxhdpi" ];

var qrc = "";

function adpiToQdpi(adpi) {
    let rgxadpi = /drawable-([a-z]+)/;

    if(rgxadpi.test(adpi)) {
        let m = rgxadpi.exec(adpi);
        adpi = m[1];
    }

    if(adpi === "mdpi")
        return "";
    else if(adpi === "xhdpi")
        return "@2x";
    else if(adpi === "xxhdpi")
        return "@3x";
    else if(adpi === "xxxhdpi")
        return "@4x";

    return false;
}

function cloneRepository() {
    if(fs.existsSync(IN_FOLDER_NAME)) {
        console.log("Folder already exists, skipping repository clone");
        return;
    }

    console.log("Cloning repository...")
    git().clone(REPO, IN_FOLDER_NAME);
}

function readIcons() {
    let categories = fs.readdirSync(IN_FOLDER_NAME);

    console.log("Creating folders...")
    fs.mkdirSync(OUT_FOLDER_NAME);
    fs.mkdirSync(path.join(OUT_FOLDER_NAME, "black"));
    fs.mkdirSync(path.join(OUT_FOLDER_NAME, "white"));

    for(let i = 0; i < categories.length; i++) {
        let category = categories[i];

        if(category.indexOf(".") > -1 || category === "LICENSE")
            continue;

        console.log("Reading " + category + " category...");

        SUPPORTED_ADPI.forEach(function(adpi) {
            let qdpi = adpiToQdpi(adpi)

            if(qdpi === false)
                return;

            let inpath = path.join(IN_FOLDER_NAME, category, adpi);

            if(!fs.existsSync(inpath))
                return;

            let icons = fs.readdirSync(inpath);

            icons.forEach(function(icon) {
                parseIcon(icon, qdpi, inpath);
            });
        });
    }

    console.log("Copying LICENSE...")
    fsextra.copySync(path.join(IN_FOLDER_NAME, "LICENSE"), 
                     path.join(OUT_FOLDER_NAME, "LICENSE"));
}

function parseIcon(icon, qdpi, inpath) {
    let rgxfile = /ic_(.+)(black|white)_24dp\.png/;

    if(!rgxfile.test(icon))
        return;

    let iconinfo = rgxfile.exec(icon);
    let outicon = iconinfo[1].slice(0, -1) + qdpi + ".png";
    let outpath = path.join(OUT_FOLDER_NAME, iconinfo[2], outicon);

    fsextra.copySync(path.join(inpath, icon), outpath);

    if(OUT_FOLDER_NAME.startsWith("../"))
        qrc += "\t\t<file>" + outpath.replace("../", "") + "</file>\n";
    else
        qrc += "\t\t<file>" + outpath + "</file>\n";
}

function compileQrc() {
    console.log("Compiling QRC...");

    let fp = fs.openSync("../material.qrc", "w");
    fs.appendFileSync(fp, "<RCC>\n");
    fs.appendFileSync(fp, "\t<qresource prefix=\"/\">\n");
    fs.appendFileSync(fp, qrc);
    fs.appendFileSync(fp, "\t</qresource>\n");
    fs.appendFileSync(fp, "</RCC>\n");
    fs.closeSync(fp);
}

git().silent(false); // Enable stdout
cloneRepository();
readIcons();
compileQrc();
