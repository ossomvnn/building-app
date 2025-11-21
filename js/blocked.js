document.addEventListener('DOMContentLoaded', () => {
    const blockPart = document.getElementById('blockPart');
    const blockName = document.getElementById('blockName');
    const blockReason = document.getElementById('blockReason');
    const blockDays = document.getElementById('blockDays');
    const blockBtn = document.getElementById('blockBtn');
    const blockedTableBody = document.getElementById('blockedTableBody');

    // Load residents and blocked from localStorage
    function loadResidents() {
        return JSON.parse(localStorage.getItem('residents') || '[]');
    }

    function loadBlocked() {
        return JSON.parse(localStorage.getItem('blocked') || '[]');
    }

    function saveBlocked(blocked) {
        localStorage.setItem('blocked', JSON.stringify(blocked));
    }

    // Remove expired blocked entries
    function removeExpiredBlocked() {
        let blocked = loadBlocked();
        const today = new Date();
        blocked = blocked.filter(b => new Date(b.blockedUntil) >= today);
        saveBlocked(blocked);
    }

    // Populate names dropdown based on selected part
    function populateNames() {
        const part = blockPart.value;
        const residents = loadResidents();
        blockName.innerHTML = '<option value="">Select Name</option>';
        residents.filter(r => r.part === part).forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.name;
            opt.textContent = r.name;
            blockName.appendChild(opt);
        });
    }

    // Render blocked table
    function renderBlocked() {
        removeExpiredBlocked(); // Remove expired before rendering
        const blocked = loadBlocked();
        blockedTableBody.innerHTML = '';
        blocked.forEach((b, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${b.name}</td>
                <td>${b.part}</td>
                <td>${b.reason}</td>
                <td>${b.blockedUntil}</td>
                <td><button class="removeBtn" onclick="removeBlocked(${index})">Remove</button></td>
            `;
            blockedTableBody.appendChild(tr);
        });
    }

    // Add new block
    function addBlock() {
        const part = blockPart.value;
        const name = blockName.value;
        const reason = blockReason.value;
        const days = parseInt(blockDays.value);

        if (!part || !name || !reason || !days) {
            alert('Please fill all fields.');
            return;
        }

        const today = new Date();
        const blockedUntil = new Date();
        blockedUntil.setDate(today.getDate() + days);

        const blocked = loadBlocked();
        blocked.push({
            part,
            name,
            reason,
            blockedUntil: blockedUntil.toISOString().split('T')[0]
        });

        saveBlocked(blocked);

        blockPart.value = '';
        blockName.innerHTML = '<option value="">Select Name</option>';
        blockReason.value = '';
        blockDays.value = '';

        renderBlocked();
    }

    // Remove blocked with confirmation
    window.removeBlocked = function(index) {
        if (!confirm('Are you sure you want to remove this blocked person?')) return;
        const blocked = loadBlocked();
        blocked.splice(index, 1);
        saveBlocked(blocked);
        renderBlocked();
    }

    blockPart.addEventListener('change', populateNames);
    blockBtn.addEventListener('click', addBlock);

    // Auto-refresh table every minute to remove expired blocks
    setInterval(renderBlocked, 60 * 1000);

    // Initial render
    renderBlocked();
});
