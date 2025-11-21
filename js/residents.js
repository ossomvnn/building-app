function loadResidents() {
    const data = localStorage.getItem("residents");
    return data ? JSON.parse(data) : [];
}

function saveResidents(residents) {
    localStorage.setItem("residents", JSON.stringify(residents));
}

function renderResidents() {
    const residents = loadResidents();
    const tbody = document.getElementById("residentsTableBody");
    tbody.innerHTML = "";

    residents.forEach((r, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${r.name}</td>
            <td>${r.part}</td>
            <td>${r.room}</td>
            <td><button data-index="${index}" class="removeBtn">Remove</button></td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll(".removeBtn").forEach(btn => {
        btn.addEventListener("click", e => {
            const i = e.target.getAttribute("data-index");
            removeResident(i);
        });
    });
}

function removeResident(index) {
    const residents = loadResidents();
    residents.splice(index, 1);
    saveResidents(residents);
    renderResidents();
}

document.getElementById("addResidentBtn").addEventListener("click", () => {
    const name = document.getElementById("residentName").value.trim();
    const part = document.getElementById("residentPart").value;
    const room = document.getElementById("residentRoom").value.trim();

    if (!name || !part || !room) { alert("Please fill all fields"); return; }

    const residents = loadResidents();
    residents.push({name, part, room});
    saveResidents(residents);

    document.getElementById("residentName").value = "";
    document.getElementById("residentPart").value = "";
    document.getElementById("residentRoom").value = "";

    renderResidents();
});

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
});

renderResidents();
