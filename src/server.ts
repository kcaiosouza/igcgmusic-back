import http from 'http';

const port = 3333;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, TypeScript Server!');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
