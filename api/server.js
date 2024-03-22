const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 4000;
let data = require("./public/data.json");

module.exports = (req, res) => {
  res.json(data);
};

// Get all events
app.get("/api/events", (req, res) => {
  res.json(data);
});

// Get event by id
app.get("/api/events/:id", (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = data
    .map((day) => day.events)
    .flat()
    .find((event) => event.id === eventId);

  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ message: `Event with id ${eventId} not found.` });
  }
});

// Add a new event
app.post("/api/events", (req, res) => {
  const newEvent = req.body;
  newEvent.id = data.length + 1;
  newEvent.finish = 0;
  const existingDate = data.find((item) => item.days === newEvent.days);
  if (existingDate) {
    existingDate.events.push(newEvent);
  } else {
    data.push({ days: newEvent.days, events: [newEvent] });
  }
  saveDataToFile(data);
  res.json(newEvent);
});

// Update event
app.put("/api/events/:id", (req, res) => {
  const eventId = parseInt(req.params.id);
  const updatedEvent = req.body;
  let foundEvent = false;

  data.forEach((day) => {
    const event = day.events.find((e) => e.id === eventId);
    if (event) {
      foundEvent = true;
      Object.assign(event, updatedEvent);
      saveDataToFile(data);
      res.json(event);
    }
  });

  if (!foundEvent) {
    res.status(404).json({ message: `Event with id ${eventId} not found.` });
  }
});



// Delete event by id
app.delete("/api/events/:id", (req, res) => {
  const eventId = parseInt(req.params.id);
  let foundEvent = false;

  data.forEach((day) => {
    const index = day.events.findIndex((e) => e.id === eventId);
    if (index !== -1) {
      foundEvent = true;
      day.events.splice(index, 1);
      saveDataToFile(data);
      res.json({ message: `Event with id ${eventId} has been deleted.` });
    }
  });

  if (!foundEvent) {
    res.status(404).json({ message: `Event with id ${eventId} not found.` });
  }
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

//function to save what you doing on open web to file
function saveDataToFile(data) {
  fs.writeFile(
    path.join(__dirname, "public", "data.json"),
    JSON.stringify(data),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}
