require("dotenv").config();
const express = require("express");
const cors = require("cors");
const humanizeRoute = require("./routes/humanize");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/humanize", humanizeRoute);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
