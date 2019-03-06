const fs = require('fs');
const axios = require('axios');
const Nightmare = require('nightmare');

const nightmare = new Nightmare({ show: true });

nightmare
  .goto('https://aws.amazon.com/whitepapers/')
  .wait('.lb-bg-logo')
  .evaluate(() => {
    const reggie = new RegExp(`.pdf$`);
    const allAnchors = [...document.getElementsByTagName('a')];
    return allAnchors
      .map(a => (reggie.test(a.href) ? a.href : undefined))
      .filter(x => x);
  })
  .end()
  .then(anchors => {
    anchors.forEach(url => {
      axios({
        method: 'get',
        url,
        responseType: 'stream'
      })
        .then(response => {
          const urlPieces = url.split('/');
          const filename = urlPieces[urlPieces.length - 1];
          response.data.pipe(fs.createWriteStream(`./pdfs/${filename}`));
        })
        .catch(console.error);
    });
  })
  .catch(console.error);
