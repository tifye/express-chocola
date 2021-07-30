import express from 'express';

const app = express();

app.get('/', (req, res) => {
  console.log(req.headers, req.body);
  res.send('Mino!');
});

app.listen(10000);
