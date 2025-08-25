const http = require("http");

http
  .createServer((req, res) => {
    if (req.url == "/ban-me") {
      res.writeHead(429);
      return res.end();
    }

    res.writeHead(200);
    res.write("Hi, i'm a dummy server.");
    res.end();
  })
  .listen(3000);
