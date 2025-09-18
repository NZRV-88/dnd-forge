const express = require('express');
const app = express();
const port = process.env.PORT || 8081;

app.get('/', (req, res) => res.send('App is running'));

app.listen(port, () => console.log(`Server listening on ${port}`));
