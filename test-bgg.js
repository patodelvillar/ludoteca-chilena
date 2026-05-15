const https = require('https');

const options = {
  hostname: 'boardgamegeek.com',
  path: '/xmlapi2/search?query=Una+Manga+de+Bichos&type=boardgame&exact=1',
  headers: { 'User-Agent': 'LudotecaChilenaApp/1.0' }
};

https.get(options, (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { console.log(data); });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
