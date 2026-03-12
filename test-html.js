async function test() {
    const html = await fetch("https://ilovedesi.fun").then(r => r.text());
    console.log("Found string 'Hot Indian Girl BF Sex XXX Porn Video'?", html.includes("Hot Indian Girl BF Sex XXX Porn Video"));
    
    // Find all image sources
    const imgMatches = html.matchAll(/src="([^"]+?)"/g);
    const sources = Array.from(imgMatches).map(m => m[1]);
    console.log("Found", sources.length, "images");
    console.log(sources.filter(s => s.includes('/uploads/')));
}
test();
