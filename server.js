express = require("express");
cors = require("cors");

// Path: server.js
const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*'
}));

app.use(express.static("."));


app.listen(PORT, () => {
});
