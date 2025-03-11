const http = require("http");
const sqlite3 = require("sqlite3").verbose();

// Creates a connection to the database. If it doesn’t exist, this code will create a database with this name.
const db = new sqlite3.Database("truck_transactions.db", (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Connection established successfully.");
    }
});

// Creates a table if it does not exist in the truck_transactions.db database.
db.run(
    `CREATE TABLE IF NOT EXISTS TruckTransactions(
        TransactionID INTEGER PRIMARY KEY AUTOINCREMENT,
        TruckName TEXT,
        SellerName TEXT,
        BuyerName TEXT,
        GoodsName TEXT,
        Specification TEXT,
        Gross FLOAT,
        Tare FLOAT,
        Net FLOAT,
        Date TEXT,
        GrossTime TEXT,
        TareTime TEXT,
        Fees FLOAT
    )`,
    (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Table created successfully.");
        }
    }
);

// Executes a query to retrieve all information from the TruckTransactions table.
const search = (callback) => {
    db.all("SELECT * FROM TruckTransactions", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            callback(rows);
        }
    });
};

// Prepares a query to add data to the TruckTransactions table.
const insertData = db.prepare(
    `INSERT INTO TruckTransactions (TruckName, SellerName, BuyerName, GoodsName, Specification, Gross, Tare, Net, Date, GrossTime, TareTime, Fees)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Data inserted successfully.");
        }
    }
);

// Prepares a query to delete data from the TruckTransactions table.
const deleteData = db.prepare(
    `DELETE FROM TruckTransactions WHERE TransactionID == ?`,
    (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Data deleted successfully.");
        }
    }
);

// Prepares a query to modify data in the TruckTransactions table.
const modifyData = db.prepare(
    `UPDATE TruckTransactions
      SET TruckName = ?,
          SellerName = ?,
          BuyerName = ?,
          GoodsName = ?,
          Specification = ?,
          Gross = ?,
          Tare = ?,
          Net = ?,
          GrossTime = ?,
          TareTime = ?,
          Fees = ?
      WHERE TransactionID = ?`,
     (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Data modified successfully.");
        }
     }
);

// Now we create the server and bring the database information to the server.
const server = http.createServer((req, res) => {
    // Allow CORS to avoid issues in this example.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Returns all information to the server.
    search((result) => {
        res.write(JSON.stringify(result));
        res.end();
    });

    // Checks if it is a request with the POST method.
    if (req.method === "POST") {
        let body = "";
        // Receives the information sent to the server.
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            // Deserialize the information.
            const parsedBody = JSON.parse(body);
            console.log(parsedBody);
            // Uses the prepared query to insert data received from the Frontend.
            insertData.run(
                parsedBody.TruckName,
                parsedBody.SellerName,
                parsedBody.BuyerName,
                parsedBody.GoodsName,
                parsedBody.Specification,
                parsedBody.Gross,
                parsedBody.Tare,
                parsedBody.Net,
                parsedBody.Date,
                parsedBody.GrossTime,
                parsedBody.TareTime,
                parsedBody.Fees
            );
            console.log("Data created successfully.");
        });

    // Checks if it is a request with the DELETE method.
    } else if (req.method === "DELETE") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            const parsedBody = JSON.parse(body);
            console.log(parsedBody);
            // Uses the prepared query to delete data as indicated by the Frontend.
            deleteData.run(parsedBody.TransactionID);
            console.log("Data deleted successfully.");
        });

    // Checks if it is a request with the PUT method.
    } else if (req.method === "PUT") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            const parsedBody = JSON.parse(body);
            console.log(parsedBody);
            // Uses the prepared query to modify the data received from the Frontend.
            modifyData.run(
                parsedBody.TruckName,
                parsedBody.SellerName,
                parsedBody.BuyerName,
                parsedBody.GoodsName,
                parsedBody.Specification,
                parsedBody.Gross,
                parsedBody.Tare,
                parsedBody.Net,
                parsedBody.GrossTime,
                parsedBody.TareTime,
                parsedBody.Fees,
                parsedBody.TransactionID
            );
            console.log("Data modified successfully.");
        });
    }
});

const port = 3001;

server.listen(port,  () => {
  console.log(`Server listening on http://:${port}`);
});
