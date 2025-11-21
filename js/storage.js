function loadDB() {
  let db = localStorage.getItem('db');
  if (!db) {
    db = { residents: [], codeIssues: [], blocks: [] };
    localStorage.setItem('db', JSON.stringify(db));
  } else {
    db = JSON.parse(db);
  }
  return db;
}

function saveDB(db) {
  localStorage.setItem('db', JSON.stringify(db));
}

function genId() {
  return Date.now() + Math.floor(Math.random()*1000);
}

function addResidentObj(name, part, room) {
  const db = loadDB();
  db.residents.push({ id: genId(), name, part, room });
  saveDB(db);
}
function updateResidentObj(id, newName, newPart, newRoom) {
  const db = loadDB();
  const resident = db.residents.find(r => r.id === Number(id));
  if (!resident) return;
  resident.name = newName;
  resident.part = newPart;
  resident.room = newRoom;
  saveDB(db);
}


function issueCodeObj(residentId, daysValid) {
  const db = loadDB();
  const today = new Date();
  const next = new Date();
  next.setDate(today.getDate() + Number(daysValid));
  db.codeIssues.push({
    id: genId(),
    residentId: Number(residentId),
    issueDate: today.toISOString().slice(0,10),
    daysValid: Number(daysValid),
    nextEligibleDate: next.toISOString().slice(0,10)
  });
  saveDB(db);
}

function blockResidentObj(residentId, reason) {
  const db = loadDB();
  db.blocks.push({
    id: genId(),
    residentId: Number(residentId),
    reason: reason,
    date: new Date().toISOString().slice(0,10),
    active: true
  });
  saveDB(db);
}
