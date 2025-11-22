document.addEventListener('DOMContentLoaded', () => {
    const appPart = document.getElementById("appPart");
    const residentSelect = document.getElementById("residentSelect");
    const appDate = document.getElementById("appDate");
    const appTime = document.getElementById("appTime");
    const appNote = document.getElementById("appNote");
    const addBtn = document.getElementById("addBtn");
    const appointmentsTable = document.getElementById("appointmentsTable");
    const searchBtn = document.getElementById("searchBtn");
    const searchCode = document.getElementById("searchCode");
    const searchResult = document.getElementById("searchResult");
    const backBtn = document.getElementById("backBtn");

    backBtn.addEventListener("click", () => { window.location.href = "index.html"; });

    const blocked = JSON.parse(localStorage.getItem("blocked") || "[]");

    function loadResidents() {
        return JSON.parse(localStorage.getItem("residents") || "[]");
    }

    function loadAppointments() {
        return JSON.parse(localStorage.getItem("appointments") || "[]");
    }

    function saveAppointments(list) {
        localStorage.setItem("appointments", JSON.stringify(list));
    }

    function removeExpired() {
        const now = new Date();
        let list = loadAppointments();
        list = list.filter(a => new Date(a.date + " " + a.time) >= now);
        saveAppointments(list);
    }

    // Populate resident select ONLY after Part is chosen
    function populateResidents() {
        const part = appPart.value;
        const residents = loadResidents();

        // Clear previous options
        residentSelect.innerHTML = '<option value="">Select Resident</option>';

        if (!part) return; // Do not show names if no Part selected

        // Filter residents by selected Part
        residents.filter(r => r.part === part).forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.name;
            opt.textContent = r.name;
            residentSelect.appendChild(opt);
        });
    }

    appPart.addEventListener("change", populateResidents);

    // Ensure resident select is empty initially
    residentSelect.innerHTML = '<option value="">Select Resident</option>';

  function generateCode() {
    return String(Math.floor(1000 + Math.random() * 9000)); 
}


    function isBlocked(name) {
        return blocked.some(b => b.name === name && new Date(b.until) > new Date());
    }
    function showMessage(msg) {
    const box = document.createElement("div");
    box.innerText = msg;
    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.left = "50%";
    box.style.transform = "translateX(-50%)";
    box.style.background = "#ff4444";
    box.style.color = "#fff";
    box.style.padding = "12px 18px";
    box.style.borderRadius = "8px";
    box.style.zIndex = "99999";
    box.style.fontFamily = "Segoe UI";
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2000);
}


    // --- Add appointment with OK / Print popup ---
    addBtn.addEventListener("click", () => {
        const part = appPart.value;
        const name = residentSelect.value;
        const date = appDate.value;
        const time = appTime.value;
        const note = appNote.value;

        if (!part || !name || !date || !time) {
            showMessage("Please fill all fields");
;
            return;
        }

        if (isBlocked(name)) {
            alert("This resident is blocked.");
            return;
        }

        const list = loadAppointments();
        const conflict = list.find(a => a.name === name && a.date === date && a.time === time);
        if (conflict) {
            alert("This resident already has an appointment at this date and time.");
            return;
        }

        const code = generateCode();
        list.push({ code, part, name, date, time, note });
        saveAppointments(list);

        // --- Custom confirmation popup ---
        const printChoice = confirm(`Appointment created!\nCode: ${code}\n\nPress OK to continue without printing, or Cancel to print now.`);
        if (!printChoice) {
            // Cancel pressed → print ticket
            printTicket(code);
        }

        // Reset form
        appPart.value = '';
        residentSelect.innerHTML = '<option value="">Select Resident</option>';
        appDate.value = '';
        appTime.value = '';
        appNote.value = '';

        removeExpired();
        renderTable();
    });

    // --- Delete appointment ---
    window.deleteAppointment = function(code) {
        if (!confirm("Delete this appointment?")) return;
        let list = loadAppointments();
        list = list.filter(a => a.code !== code);
        saveAppointments(list);
        renderTable();
    }

    // --- Print small receipt-style ticket ---
window.printTicket = function(code) {
    const app = loadAppointments().find(a => a.code === code);
    if (!app) return alert("Appointment not found.");

    // Open a new window for printing
    const win = window.open("", "_blank");

        win.document.write(`
        
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Terminbestätigung</title>
    <style>
        /* A4 Layout */
        @page {
            size: A4;
            margin: 25mm 20mm 25mm 20mm;
        }

        body {
            font-family: "Segoe UI", Tahoma, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            width: 100%;
        }

        .container {
            width: 100%;
        }

        .logo {
            width: 120px;
            margin-bottom: 20px;
        }

        .sender {
            font-size: 10px; /* very small */
            text-decoration: underline;
            margin-bottom: 5px;
        }

        /* Receiver block prominent */
        .receiver {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 30px;
        }
        .date {
            text-align: right;
            margin-bottom: 20px;
        }

        h2 {
            margin-top: 0;
            margin-bottom: 10px;
        }

        .section-title {
            margin-top: 15px;
            font-weight: bold;
            text-decoration: underline;
        }

        ul {
            margin-top: 5px;
        }

        hr {
            margin: 15px 0;
        }
    </style>
</head>
<body>

<div class="container">

  <br>
  <br>

    <!-- Compact Sender (small, underlined, one line) -->
    <div class="sender">
        UPPEN | Osterhuser 49 B , 26759 Hinte 
    </div>

    <!-- Receiver (big, prominent) -->
    <div class="receiver">
        <strong>${app.name}</strong><br>
        <br>
        Hinte 26759
    </div>
<br>
<br>
<br>

 <div class="date">
    Hinte, den <span id="todayGerman"></span>
</div>

<script>
    const d = new Date();
    const germanDate =
        String(d.getDate()).padStart(2, "0") + "." +
        String(d.getMonth() + 1).padStart(2, "0") + "." +
        d.getFullYear();

    document.getElementById("todayGerman").textContent = germanDate;
</script>

<br>
<br>
<br>
    <!-- Subject -->
    <h2><strong>Terminbestätigung</strong></h2>

    <!-- Content -->
    <p>
        Sehr geehrte/r <strong>${app.name}</strong>,
    </p>

    <p>
        hiermit bestätigen wir Ihnen Ihren Termin in unserem Büro.  
        Die Details finden Sie im Folgenden:
    </p>

    <div class="section-title">Termindetails</div>
    <p>
        <strong>Datum:</strong> ${app.date}<br>
        <strong>Uhrzeit:</strong> ${app.time}<br>
        <strong>Adresse:</strong> Osterhuser 49 A , 26759 Hinte<br>
        <strong>Code:</strong> ${app.code}
    </p>


        <strong>${app.note || "-"}</strong>
    

    <p>
        Falls Sie den Termin nicht wahrnehmen können, informieren Sie uns bitte rechtzeitig.
    </p>

    <br><br>
    <p>Mit freundlichen Grüßen</p>

    <p>
        <br>
        <h4 onclick="window.print()">UPPEN</h4>
    </p>

</div>

</body>
</html>


        `);
    }

    // --- Render appointments table ---
    function renderTable() {
        removeExpired();
        const list = loadAppointments();
        appointmentsTable.innerHTML = '';
        list.forEach(a => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${a.code}</td>
                <td>${a.name}</td>
                <td>${a.date}</td>
                <td>${a.time}</td>
                <td>${a.note || "-"}</td>
                <td>
                    <button class="printBtn" onclick="printTicket('${a.code}')">Print</button>
                    <button class="deleteBtn" onclick="deleteAppointment('${a.code}')">Delete</button>
                </td>
            `;
            appointmentsTable.appendChild(tr);
        });
    }

    // --- Search by code ---
    searchBtn.addEventListener("click", () => {
        const code = searchCode.value.trim();
        const app = loadAppointments().find(a => a.code === code);
        if (!app) {
            searchResult.style.display = "block";
            searchResult.innerHTML = "<strong>No appointment found.</strong>";
            return;
        }
        searchResult.style.display = "block";
        searchResult.innerHTML = `
        
            <strong>Name:</strong> ${app.name}<br>
            <strong>Part:</strong> ${app.part}<br>
            <strong>Date:</strong> ${app.date}<br>
            <strong>Time:</strong> ${app.time}<br>
            <strong>Note:</strong> ${app.note || "-"}<br>
            <strong>Code:</strong> ${app.code}
        `;
    });

    // --- Init ---
    removeExpired();
    residentSelect.innerHTML = '<option value="">Select Resident</option>';
    renderTable();
});
