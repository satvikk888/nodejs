const express = require("express");
const app = express();
const PORT = 3000;

// In-memory seat store
// status: available | locked | booked
let seats = {
  1: { status: "available", lockExpiry: null },
  2: { status: "available", lockExpiry: null },
  3: { status: "available", lockExpiry: null },
  4: { status: "available", lockExpiry: null },
  5: { status: "available", lockExpiry: null }
};

// Middleware to parse JSON
app.use(express.json());

// Utility: Check and auto-expire locks
function checkExpiredLocks() {
  const now = Date.now();
  for (const seatId in seats) {
    if (seats[seatId].status === "locked" && seats[seatId].lockExpiry <= now) {
      seats[seatId].status = "available";
      seats[seatId].lockExpiry = null;
    }
  }
}

// 1. Get all seats
app.get("/seats", (req, res) => {
  checkExpiredLocks();
  res.json(seats);
});

// 2. Lock a seat
app.post("/lock/:id", (req, res) => {
  const id = req.params.id;
  checkExpiredLocks();

  if (!seats[id]) {
    return res.status(404).json({ message: "Seat not found" });
  }

  if (seats[id].status === "available") {
    seats[id].status = "locked";
    seats[id].lockExpiry = Date.now() + 60 * 1000; // lock for 1 minute
    return res.json({ message: `Seat ${id} locked successfully. Confirm within 1 minute.` });
  } else {
    return res.status(400).json({ message: `Seat ${id} is not available.` });
  }
});

// 3. Confirm booking
app.post("/confirm/:id", (req, res) => {
  const id = req.params.id;
  checkExpiredLocks();

  if (!seats[id]) {
    return res.status(404).json({ message: "Seat not found" });
  }

  if (seats[id].status === "locked") {
    seats[id].status = "booked";
    seats[id].lockExpiry = null;
    return res.json({ message: `Seat ${id} booked successfully!` });
  } else {
    return res.status(400).json({ message: `Seat is not locked and cannot be booked` });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
