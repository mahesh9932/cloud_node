const express = require("express");
const app = express();
const fs = require("fs");
const csv = require("csv-parser");
const csvtoJson = require("csvtojson");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.post("/api/signup", async (req, res) => {
  console.log("hi");
  const { username, password, email } = req.body;

  // Save user data to file
  const data = `${username},${password},${email}\n`;
  console.log(data);
  let inputData;
  fs.readFile("./users.json", "utf8", (err, cnt) => {
    if (err) {
      console.log(err, cnt);
    }
    console.log("cnt", cnt);

    inputData = JSON.parse(cnt);

    console.log("inputData", inputData);
    inputData[username] = password;
    const outputData = JSON.stringify(inputData);
    fs.writeFile("users.json", outputData, (err) => {
      console.log(err);
    });
  });

  res.json({ success: true });
  // const jsonData = JSON.parse(inputData);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  fs.readFile("./users.json", "utf8", (err, cnt) => {
    if (err) {
      console.log(err, cnt);
    }
    console.log("cnt", cnt);

    const users = JSON.parse(cnt);
    let flag = false;
    for (let k in users) {
      if (k == username && users[k] == password) {
        flag = true;
      }
    }

    if (flag) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

app.get("/data/:id", (req, res) => {
  const id = req.params.id;
  const results = [];

  fs.createReadStream("result_final.csv")
    .pipe(csv())
    .on("data", (data) => {
      if (data.HSHD_NUM === id) {
        results.push(data);
      }
    })
    .on("end", () => {
      res.json(results);
    });
});

app.get("/timeSeriesData", async (req, res) => {
  let data = {};

  fs.createReadStream("result_final.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (data[row.PURCHASE_]) {
        data[row.PURCHASE_] += parseInt(row.SPEND);
      } else {
        data[row.PURCHASE_] = parseInt(row.SPEND);
      }
    })
    .on("end", () => {
      res.json(data);
    });
});

app.get("/barChartData", async (req, res) => {
  console.log("hitted");

  let data = {};

  fs.createReadStream("result_final.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (data[row.COMMODITY]) {
        data[row.COMMODITY] += parseInt(row.SPEND);
      } else {
        data[row.COMMODITY] = parseInt(row.SPEND);
      }
    })
    .on("end", () => {
      data = Object.entries(data);
      const sortedData = data.sort((a, b) => b[1] - a[1]);
      const top7Commodities = sortedData.slice(0, 7);
      d = {};
      for (let x of top7Commodities) {
        d[x[0]] = x[1];
      }
      res.json(d);
    });
});

app.get("/data", async (req, res) => {
  const regionData = {};

  fs.createReadStream("result_final.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (regionData[row.STORE_R]) {
        regionData[row.STORE_R] += parseInt(row.SPEND);
      } else {
        regionData[row.STORE_R] = parseInt(row.SPEND);
      }
    })
    .on("end", () => {
      res.json(regionData);
    });
});

app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
