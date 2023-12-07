import Jimp from 'jimp';
import { setWallpaper } from 'wallpaper';

const LabelTemplatePath='./label.png';
const WallpaperUrl = 'https://www.wikiart.org/fr/App/home?json=2&param=artwork-of-the-day';
const ImagePath = './result.jpg';

async function ChangeWallpaper() {
    const { url, title, date, artist } = await getImageUrl();
    await ModifyImage(url, title, date, artist);
    await setWallpaper(ImagePath);
}
ChangeWallpaper();



async function getImageUrl() {
    let data = await (await fetch(WallpaperUrl)).json();
    let paintings = data.Paintings;
    let painting = paintings[Math.floor(Math.random() * (paintings.length))];
    const title = decodeHtml(painting.title);
    const artist = decodeHtml(painting.artistName);
    return {
        url: painting.image,
        title: title,
        date: painting.year,
        artist: artist
    };
}

async function ModifyImage(url, title, date, artist) {
    let label = await CreateLabel(title, date, artist);
    let image = await Jimp.read(url);
    image.contain(1920, 1080);
    image = image.composite(label, 1920/2 - label.getWidth()/2, 900 - label.getHeight()/2);
    image.write(ImagePath);
}


async function CreateLabel(title, date, artist) {
    const infoText = `${artist}, ${date}`;
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    let image = await Jimp.read(LabelTemplatePath);
    image = image.resize(300, 100);
    image = image.print(font, 10, 20, title, 300);
    image = image.print(font, 10, 70, infoText, 300);
    return image;
}



function decodeHtml(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

