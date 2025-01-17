// server.js

const fs = require("fs");
const path = require("path");

let data = require("./data.json");

export const getEvents = (req, res) => {
  res.json(data);
};

export const getEventById = (req, res) => {
  const eventId = parseInt(req.query.id);
  const event = data
    .map((day) => day.events)
    .flat()
    .find((event) => event.id === eventId);

  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ message: `Event with id ${eventId} not found.` });
  }
};

export const addEvent = (req, res) => {
  const newEvent = req.body;
  newEvent.id = data.reduce((maxId, day) => {
    return Math.max(maxId, ...day.events.map((event) => event.id));
  }, 0) + 1;
  newEvent.finish = 0;
  const existingDate = data.find((item) => item.days === newEvent.days);
  if (existingDate) {
    existingDate.events.push(newEvent);
  } else {
    data.push({ days: newEvent.days, events: [newEvent] });
  }
  saveDataToFile(data);
  res.json(newEvent);
};

export const updateEvent = (req, res) => {
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
};

export const deleteEvent = (req, res) => {
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
};

function saveDataToFile(data) {
  fs.writeFile(
    path.join(__dirname, "data.json"),
    JSON.stringify(data),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}
