import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  projectId: "simple-schedule-app-2026",
  appId: "1:151341499730:web:0a911268a701851acc668b",
  storageBucket: "simple-schedule-app-2026.firebasestorage.app",
  apiKey: "AIzaSyA4HBPyqGgFiR_sa7VbsqK_BswLudSML2A",
  authDomain: "simple-schedule-app-2026.firebaseapp.com",
  messagingSenderId: "151341499730"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const scheduleDocRef = doc(db, 'schedules', 'main');

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

let participants = [];

const tableHeadRow = document.getElementById('table-head-row');
const tableBody = document.getElementById('table-body');
const newPersonInput = document.getElementById('new-person-name');
const addPersonBtn = document.getElementById('add-person-btn');

async function syncToFirestore() {
    try {
        await setDoc(scheduleDocRef, { participants });
    } catch (e) {
        console.error("Error saving document: ", e);
        // Fallback to local storage if offline or error
        localStorage.setItem('larc_schedule_participants_v1', JSON.stringify(participants));
    }
}

async function migrateLocalData() {
    const localData = JSON.parse(localStorage.getItem('larc_schedule_participants_v1'));
    if (localData && localData.length > 0) {
        participants = localData;
        await syncToFirestore();
        localStorage.removeItem('larc_schedule_participants_v1');
    } else {
        renderTable();
    }
}

// Real-time listener for Firestore data
onSnapshot(scheduleDocRef, (docSnap) => {
    if (docSnap.exists()) {
        participants = docSnap.data().participants || [];
        renderTable();
    } else {
        migrateLocalData();
    }
}, (error) => {
    console.error("Firestore Listen Error:", error);
    // Fallback to local storage for display if DB access fails
    participants = JSON.parse(localStorage.getItem('larc_schedule_participants_v1')) || [];
    renderTable();
});

function renderTable() {
    while (tableHeadRow.children.length > 1) {
        tableHeadRow.removeChild(tableHeadRow.lastChild);
    }

    participants.forEach((p, index) => {
        const th = document.createElement('th');
        th.className = 'participant-header';
        th.innerHTML = `
            ${p.name}
            <button class="delete-btn" onclick="window.removeParticipant(${index})" title="削除"><i class="fas fa-times"></i></button>
        `;
        tableHeadRow.appendChild(th);
    });

    tableBody.innerHTML = '';
    scheduleData.forEach(schedule => {
        const tr = document.createElement('tr');
        
        const th = document.createElement('th');
        th.className = 'sticky-col';
        th.innerHTML = `
            <div class="venue-info"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${schedule.venue}</div>
            <div class="date-info">${schedule.date}</div>
            <div class="time-info">${schedule.time}</div>
        `;
        tr.appendChild(th);

        participants.forEach((p, index) => {
            const td = document.createElement('td');
            td.className = 'check-cell';
            td.setAttribute('data-name', p.name);
            
            let currentStatus = p.attendance[schedule.id];
            if (currentStatus === true) {
                p.attendance[schedule.id] = 'ok';
                currentStatus = 'ok';
            } else if (currentStatus === false) {
                delete p.attendance[schedule.id];
                currentStatus = undefined;
            }
            
            td.innerHTML = `
                <div class="check-status">
                    <button class="status-btn btn-ok ${currentStatus === 'ok' ? 'active' : ''}" title="参加"><i class="far fa-circle"></i></button>
                    <button class="status-btn btn-ng ${currentStatus === 'ng' ? 'active' : ''}" title="不参加"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            const btnOk = td.querySelector('.btn-ok');
            const btnNg = td.querySelector('.btn-ng');
            
            btnOk.onclick = (e) => window.setStatus(index, schedule.id, 'ok', e, td);
            btnNg.onclick = (e) => window.setStatus(index, schedule.id, 'ng', e, td);
            
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
        syncToFirestore();
    }
}

window.removeParticipant = function(index) {
    if (confirm(`「${participants[index].name}」を削除してもよろしいですか？`)) {
        participants.splice(index, 1);
        syncToFirestore();
    }
}

window.setStatus = function(participantIndex, scheduleId, status, event, cellElement) {
    if (event) {
        event.stopPropagation();
    }
    const p = participants[participantIndex];
    
    if (p.attendance[scheduleId] === status) {
        delete p.attendance[scheduleId];
    } else {
        p.attendance[scheduleId] = status;
    }
    
    // Optimistic UI update
    const btnOk = cellElement.querySelector('.btn-ok');
    const btnNg = cellElement.querySelector('.btn-ng');
    btnOk.classList.remove('active');
    btnNg.classList.remove('active');
    if (p.attendance[scheduleId] === 'ok') btnOk.classList.add('active');
    if (p.attendance[scheduleId] === 'ng') btnNg.classList.add('active');

    // Sync state
    syncToFirestore();
}

addPersonBtn.addEventListener('click', addParticipant);
newPersonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addParticipant();
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });

        // サービスワーカーが更新された（新しいワーカーがコントロールを開始した）時に自動リロード
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    });
}
