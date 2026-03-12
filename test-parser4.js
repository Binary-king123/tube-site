const lines = `
https://cdn.desibf.com/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.mp4
https://desibf.com/wp-content/uploads/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.jpg
`.split('\n').filter(Boolean);

const imgLines = lines.filter(l => l.match(/\.(jpg|jpeg|png|webp)/i));
const mp4Url = "https://cdn.desibf.com/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.mp4";

const urlParts = mp4Url.split('/');
const filenameWithExt = urlParts[urlParts.length - 1];
const basename = filenameWithExt.replace(/\.[^/.]+$/, "");

console.log("Basename:", basename);
console.log("imgLines[0]:", imgLines[0]);
console.log("Includes?", imgLines[0].toLowerCase().includes(basename.toLowerCase()));

// Let's print the char codes to see if there are hidden characters
for(let i=0; i<basename.length; i++) {
   if(basename.charCodeAt(i) !== imgLines[0].substring(47).charCodeAt(i)) {
      console.log("Mismatch at", i, basename[i], imgLines[0].substring(47)[i]);
   }
}
