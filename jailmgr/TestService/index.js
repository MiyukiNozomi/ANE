const { readdirSync } = require("fs");
const http = require("http");

const sv = http.createServer((req, res) => {
    console.log(req.method + " " + req.url);
    res.writeHead(200);
    res.write(`
<html>
<head>
body, html {
background-color: #222222;
color: #ffffff;
max-width: 100%;
min-height: 100%;
}
</head>
<body>        
<p>Hiii!! heres my file list:</p>
${readdirSync("/").map(v => `<p>- ${v}</p>\n`).join("")}
</body>
</html>`);
    res.end();
});
sv.on("listening", ()=> "Hey i am running and jailed!");
sv.listen(8060);