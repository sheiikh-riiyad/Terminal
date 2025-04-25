const http = require("http");
const sqlite3 = require("sqlite3").verbose();

// Creates a connection to the database.
const db = new sqlite3.Database("truck_transactions.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connection established successfully.");

        // Creates the TruckTransactions table if it does not exist.
        db.run(
            `CREATE TABLE IF NOT EXISTS TruckTransactions(
                TransactionID INTEGER PRIMARY KEY,
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
                    console.error("Error creating table:", err);
                } else {
                    console.log("Table created successfully.");

                    // Prepare the insertData statement after table creation
                    insertData = db.prepare(
                        `INSERT INTO TruckTransactions ( TransactionID, TruckName, SellerName, BuyerName, GoodsName, Specification, Gross, Tare, Net, Date, GrossTime, TareTime, Fees)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    );
                }
            }
        );
    }
});

// Retrieves all data from the TruckTransactions table.
const search = (callback) => {
    db.all("SELECT * FROM TruckTransactions", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            callback(rows);
        }
    });
};

// Declare insertData without initializing it
let insertData;

// Creates the server and handles only GET and POST requests.
const server = http.createServer((req, res) => {
    // Allow CORS for frontend access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight (OPTIONS) requests
    if (req.method === "OPTIONS") {
        res.writeHead(204); // No content
        res.end();
        return;
    }

    if (req.method === "GET") {
        // Fetch and return all data from the database
        search((result) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
        });
    } else if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            const parsedBody = JSON.parse(body);
            console.log("Received data for insertion:", parsedBody);

            // Insert data into the TruckTransactions table
            insertData.run(
                parsedBody.TransactionID,
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
                parsedBody.Fees,
                (err) => {
                    if (err) {
                        console.error("Error inserting data:", err);
                        res.writeHead(500);
                        res.end("Error inserting data");
                    } else {
                        res.writeHead(201);
                        res.end("Data inserted successfully");
                    }
                }
            );
        });
    } else {
        // Respond with 405 Method Not Allowed for unsupported methods
        res.writeHead(405);
        res.end("Method Not Allowed");
    }
});

const port = 8887;
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
