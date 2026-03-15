const http = require('http');
const Gun = require('gun');

const port = process.env.PORT || 8765;

const server = http.createServer((req, res) => {
  if(Gun.serve(req, res)){ return } // filters gun requests!
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('MAKAI Smile Machine Trust (GunJS) Node\n');
});

const gun = Gun({
  web: server,
  localStorage: false,
  radisk: true, 
  dir: 'radata',
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🏴‍☠️ MAKAI Smile Machine Trust is running at 0.0.0.0:${port}/gun`);
});
