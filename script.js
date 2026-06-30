const scheduleData = [
    { id: 'd1', venue: '東京 国立代々木競技場第一体育館', date: '2026年10月09日(金)', time: 'OPEN17:00 START18:30' },
    { id: 'd2', venue: '東京 国立代々木競技場第一体育館', date: '2026年10月11日(日)', time: 'OPEN15:30 START17:00' },
    { id: 'd3', venue: '東京 国立代々木競技場第一体育館', date: '2026年10月12日(月/祝)', time: 'OPEN15:30 START17:00' },
    { id: 'd4', venue: '福岡 マリンメッセ福岡 A館', date: '2026年10月31日(土)', time: 'OPEN15:30 START17:00' },
    { id: 'd5', venue: '福岡 マリンメッセ福岡 A館', date: '2026年11月01日(日)', time: 'OPEN15:30 START17:00' },
    { id: 'd6', venue: '愛知 IGアリーナ', date: '2026年11月21日(土)', time: 'OPEN15:30 START17:00' },
    { id: 'd7', venue: '愛知 IGアリーナ', date: '2026年11月22日(日)', time: 'OPEN15:30 START17:00' },
    { id: 'd8', venue: '神奈川 横浜アリーナ', date: '2026年11月28日(土)', time: 'OPEN15:30 START17:00' },
    { id: 'd9', venue: '神奈川 横浜アリーナ', date: '2026年11月29日(日)', time: 'OPEN15:30 START17:00' },
    { id: 'd10', venue: '千葉 ららアリーナ 東京ベイ', date: '2026年12月12日(土)', time: 'OPEN15:30 START17:00' },
    { id: 'd11', venue: '千葉 ららアリーナ 東京ベイ', date: '2026年12月13日(日)', time: 'OPEN15:30 START17:00' },
    { id: 'd12', venue: '大阪 大阪城ホール', date: '2026年12月16日(水)', time: 'OPEN17:00 START18:30' },
    { id: 'd13', venue: '大阪 大阪城ホール', date: '2026年12月17日(木)', time: 'OPEN17:00 START18:30' },
    { id: 'd14', venue: '東京 有明アリーナ', date: '2026年12月24日(木)', time: 'OPEN17:00 START18:30' },
    { id: 'd15', venue: '東京 有明アリーナ', date: '2026年12月26日(土)', time: 'OPEN15:30 START17:00' },
    { id: 'd16', venue: '東京 有明アリーナ', date: '2026年12月27日(日)', time: 'OPEN15:30 START17:00' }
];

// Initialize from LocalStorage
let participants = JSON.parse(localStorage.getItem('larc_schedule_participants_v1')) || [];

const tableHeadRow = document.getElementById('table-head-row');
const tableBody = document.getElementById('table-body');
const newPersonInput = document.getElementById('new-person-name');
const addPersonBtn = document.getElementById('add-person-btn');

function saveToLocalStorage() {
    localStorage.setItem('larc_schedule_participants_v1', JSON.stringify(participants));
}

function renderTable() {
    // Clear dynamic columns in header
    while (tableHeadRow.children.length > 1) {
        tableHeadRow.removeChild(tableHeadRow.lastChild);
    }

    // Render Participant Headers
    participants.forEach((p, index) => {
        const th = document.createElement('th');
        th.className = 'participant-header';
        th.innerHTML = `
            ${p.name}
            <button class="delete-btn" onclick="removeParticipant(${index})" title="削除"><i class="fas fa-times"></i></button>
        `;
        tableHeadRow.appendChild(th);
    });

    // Render Body Rows
    tableBody.innerHTML = '';
    scheduleData.forEach(schedule => {
        const tr = document.createElement('tr');
        
        // Schedule Info Cell
        const th = document.createElement('th');
        th.className = 'sticky-col';
        th.innerHTML = `
            <div class="venue-info"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${schedule.venue}</div>
            <div class="date-info">${schedule.date}</div>
            <div class="time-info">${schedule.time}</div>
        `;
        tr.appendChild(th);

        // Checkmark Cells
        participants.forEach((p, index) => {
            const td = document.createElement('td');
            td.className = 'check-cell';
            const isChecked = p.attendance[schedule.id];
            
            // Add icon placeholder
            td.innerHTML = '<i class="fas fa-check"></i>';
            
            if (isChecked) {
                td.classList.add('checked');
            }
            
            td.onclick = () => toggleCheck(index, schedule.id, td);
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}

function addParticipant() {
    const name = newPersonInput.value.trim();
    if (name) {
        participants.push({
            name: name,
            attendance: {} 
        });
        newPersonInput.value = '';
        saveToLocalStorage();
        renderTable();
    }
}

function removeParticipant(index) {
    if (confirm(`「${participants[index].name}」を削除してもよろしいですか？`)) {
        participants.splice(index, 1);
        saveToLocalStorage();
        renderTable();
    }
}

function toggleCheck(participantIndex, scheduleId, cellElement) {
    const p = participants[participantIndex];
    p.attendance[scheduleId] = !p.attendance[scheduleId];
    saveToLocalStorage();
    
    // Toggle class for animation instead of full re-render
    if (p.attendance[scheduleId]) {
        cellElement.classList.add('checked');
    } else {
        cellElement.classList.remove('checked');
    }
}

addPersonBtn.addEventListener('click', addParticipant);
newPersonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addParticipant();
    }
});

// Initial Render
renderTable();
