document.addEventListener('DOMContentLoaded', () => {
    const codePart = document.getElementById('codePart');
    const codeName = document.getElementById('codeName');
    const daysCount = document.getElementById('daysCount');
    const totalCodes = document.getElementById('totalCodes');
    const giveCodeBtn = document.getElementById('giveCodeBtn');
    const codesTableBody = document.getElementById('codesTableBody');

    function loadResidents() {
        return JSON.parse(localStorage.getItem('residents') || '[]');
    }

    function loadCodes() {
        return JSON.parse(localStorage.getItem('codes') || '[]');
    }

    function saveCodes(codes) {
        localStorage.setItem('codes', JSON.stringify(codes));
    }

    function loadBlocked() {
        return JSON.parse(localStorage.getItem('blocked') || '[]');
    }

    // Remove expired codes
    function removeExpiredCodes() {
        let codes = loadCodes();
        const today = new Date();
        codes = codes.filter(c => new Date(c.nextAllowed) >= today);
        saveCodes(codes);
    }

    // Render codes table
    function renderCodes() {
        removeExpiredCodes();
        const codes = loadCodes();
        codesTableBody.innerHTML = '';
        codes.forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.name}</td>
                <td>${c.part}</td>
                <td>${c.codeDate}</td>
                <td>${c.nextAllowed}</td>
                <td>${c.totalCodes}</td>
                <td><button class="removeBtn" onclick="deleteCode(${index})">Remove</button></td>
            `;
            codesTableBody.appendChild(tr);
        });
    }

    // Populate names dropdown based on part
    function populateNames() {
        const part = codePart.value;
        const residents = loadResidents();
        codeName.innerHTML = '<option value="">Select Name</option>';
        residents.filter(r => r.part === part).forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.name;
            opt.textContent = r.name;
            codeName.appendChild(opt);
        });
    }

    // Issue a code
    function giveCode() {
        const part = codePart.value;
        const name = codeName.value;
        const days = parseInt(daysCount.value);
        const total = parseInt(totalCodes.value);

        if (!part || !name || !days || !total) {
            alert('Please fill all fields.');
            return;
        }

        const today = new Date();
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + days);

        const codes = loadCodes();
        const blocked = loadBlocked();

        // Check if person is blocked
        const isBlocked = blocked.find(b => b.name === name && b.part === part);
        if (isBlocked) {
            alert(`Cannot issue code. This person is blocked for: ${isBlocked.reason}`);
            return;
        }

        // Check if person already has an active code
        const existing = codes.find(c => c.name === name);
        if (existing) {
            const nextAllowedDate = new Date(existing.nextAllowed);
            if (today < nextAllowedDate) {
                alert(`Cannot issue code. Next allowed date: ${existing.nextAllowed}`);
                return;
            }
        }

        codes.push({
            part,
            name,
            codeDate: today.toISOString().split('T')[0],
            nextAllowed: nextDate.toISOString().split('T')[0],
            totalCodes: total
        });

        saveCodes(codes);
        renderCodes();

        // Reset form
        codePart.value = '';
        codeName.innerHTML = '<option value="">Select Name</option>';
        daysCount.value = '';
        totalCodes.value = '';
    }

    giveCodeBtn.addEventListener('click', giveCode);
    codePart.addEventListener('change', populateNames);

    // Remove code with confirmation
    window.deleteCode = function(index) {
        if (!confirm('Remove this code?')) return;
        const codes = loadCodes();
        codes.splice(index, 1);
        saveCodes(codes);
        renderCodes();
    }

    // Auto-refresh every minute to remove expired codes
    setInterval(renderCodes, 60 * 1000);

    // Initial render
    renderCodes();
});
