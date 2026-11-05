const fs = require('node:fs');
fs.writeFileSync('dist/.nojekyll', '');
const file = 'dist/index.html';
const html = fs.readFileSync(file, 'utf8')
  .replace(/<title>.*?<\/title>/, '<title>Blue Tree | Mango Tree Purchase System</title>')
  .replace('</head>', '<meta name="description" content="Calculate mango tree prices, delivery and planting charges with The Blue Tree purchase system." /></head>');
fs.writeFileSync(file, html);
