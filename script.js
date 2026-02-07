/* =========================================
   script.js - MMD BORROW SYSTEM (ULTIMATE)
   ========================================= */

/* --- PART 1: Data Initialization --- */
function getUsers() {
    const users = localStorage.getItem('usersDB_final_v2');
    if (!users) {
        const defaultUsers = [
            { username: "phongphiphat.pr@rmuti.ac.th", password: "0624960871kopiko", role: "admin", name: "Phongphiphat (Admin)" },
            { username: "admin", password: "123", role: "admin", name: "Super Admin" },
            { username: "student", password: "123", role: "user", name: "นักศึกษา ทดสอบ" }
        ];
        localStorage.setItem('usersDB_final_v2', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(users);
}

function getRequests() {
    const data = localStorage.getItem('borrowDB_final');
    if (data) return JSON.parse(data);
    return [
        { id: 101, user: "นาย ก.", item: "Canon EOS R5", date: "2026-02-01", status: "pending" },
        { id: 102, user: "น.ส. ข.", item: "Manfrotto 055", date: "2026-02-02", status: "approved" }
    ];
}

function getItems() {
    const data = localStorage.getItem('itemsDB');
    if (data) return JSON.parse(data);
    const defaultItems = [
        { id: 1, name: "Canon EOS R5", category: "camera", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Canon+EOS+R5" },
        { id: 2, name: "Sony A7 IV", category: "camera", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Sony+A7+IV" },
        { id: 3, name: "Manfrotto 055", category: "tripod", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Manfrotto" },
        { id: 4, name: "Rode VideoMic", category: "audio", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Rode+Mic" },
        { id: 5, name: "Aputure 120d", category: "light", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Aputure+Light" },
        { id: 6, name: "GoPro Hero 11", category: "camera", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=GoPro+11" },
        { id: 7, name: "DJI Ronin RS3", category: "tripod", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=DJI+Gimbal" },
        { id: 8, name: "Zoom H6", category: "audio", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Zoom+H6" }
    ];
    localStorage.setItem('itemsDB', JSON.stringify(defaultItems));
    return defaultItems;
}

/* --- Global Variables --- */
let items = getItems();
let borrowRequests = getRequests();
let users = getUsers();

function saveData() {
    localStorage.setItem('borrowDB_final', JSON.stringify(borrowRequests));
    localStorage.setItem('itemsDB', JSON.stringify(items));
    localStorage.setItem('usersDB_final_v2', JSON.stringify(users));
}

/* --- PART 2: Auth System --- */
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { window.location.href = 'index.html'; return null; }
    const display = document.querySelector('.user-info span') || document.querySelector('.admin-profile span');
    if(display) display.innerText = user.name;
    
    // Back to Admin Btn
    if (user.role === 'admin' && window.location.pathname.includes('dashboard.html')) {
        const userInfoDiv = document.querySelector('.user-info');
        if (!document.getElementById('backToAdminBtn')) {
            const btn = document.createElement('button');
            btn.id = 'backToAdminBtn';
            btn.innerHTML = '<i class="fas fa-user-shield"></i> กลับหน้า Admin';
            btn.style.cssText = "margin-right:10px; background:#333; border:1px solid #ff6600; color:#ff6600; padding:5px 15px; border-radius:20px; cursor:pointer; font-size:12px; font-weight:bold;";
            btn.onclick = function() { window.location.href = 'admin.html'; };
            userInfoDiv.insertBefore(btn, userInfoDiv.firstChild);
        }
    }
    return user;
}

function login(u, p) {
    const user = users.find(x => x.username === u && x.password === p);
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        user.role === 'admin' ? window.location.href = 'admin.html' : window.location.href = 'dashboard.html';
    } else { alert("❌ ชื่อผู้ใช้หรือรหัสผ่านผิด"); }
}

function register(u, p, n) {
    if(users.find(x => x.username === u)) { alert("❌ มีผู้ใช้นี้แล้ว"); return; }
    users.push({ username: u, password: p, role: "user", name: n });
    saveData();
    alert("✅ สมัครสำเร็จ");
    toggleForm();
}

function logout() { localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }

/* --- PART 3: Page Logic --- */

// LOGIN PAGE
if(document.getElementById('loginForm')) {
    window.toggleForm = function() {
        document.getElementById('loginForm').classList.toggle('hidden');
        document.getElementById('registerForm').classList.toggle('hidden');
    }
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        login(document.getElementById('username').value, document.getElementById('password').value);
    }
    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        register(document.getElementById('regUser').value, document.getElementById('regPass').value, document.getElementById('regName').value);
    }
}

// USER DASHBOARD
if(window.location.pathname.includes('dashboard.html')) {
    window.onload = function() { checkAuth(); renderItems(); }

    window.renderItems = function(cat = 'all') {
        const grid = document.getElementById('itemGrid');
        grid.innerHTML = '';
        items.forEach(item => {
            if(cat !== 'all' && item.category !== cat) return;
            const isBorrowed = borrowRequests.some(r => r.item === item.name && r.status === 'approved');
            const status = isBorrowed ? 'borrowed' : 'available';
            const btnClass = status === 'available' ? 'btn-borrow' : 'btn-disabled';
            const btnText = status === 'available' ? 'จองทันที' : 'ไม่ว่าง';
            const btnAction = status === 'available' ? `openModal('${item.name}')` : '';

            grid.innerHTML += `
            <div class="card">
                <div class="card-img">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="status-badge ${status}">${status === 'available' ? 'ว่าง' : 'ถูกยืม'}</div>
                </div>
                <div class="card-body">
                    <h4>${item.name}</h4>
                    <span class="category-tag">${item.category.toUpperCase()}</span>
                    <button class="${btnClass}" onclick="${btnAction}">${btnText}</button>
                </div>
            </div>`;
        });
    }

    window.openModal = function(name) {
        document.getElementById('modalItemName').innerText = name;
        document.getElementById('borrowerName').value = JSON.parse(localStorage.getItem('currentUser')).name;
        document.getElementById('borrowModal').style.display = 'flex';
    }
    window.closeModal = () => document.getElementById('borrowModal').style.display = 'none';

    document.getElementById('borrowForm').onsubmit = (e) => {
        e.preventDefault();
        const itemName = document.getElementById('modalItemName').innerText;
        const date = document.querySelector('input[type="date"]').value;
        borrowRequests.push({ id: Date.now(), user: document.getElementById('borrowerName').value, item: itemName, date: date, status: "pending" });
        saveData();
        alert("✅ ส่งคำขอแล้ว");
        closeModal();
    }

    window.openHistoryModal = () => {
        const me = JSON.parse(localStorage.getItem('currentUser')).name;
        const myReqs = borrowRequests.filter(r => r.user === me).sort((a,b)=>b.id-a.id);
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = myReqs.length ? '' : '<tr><td colspan="3" style="text-align:center; padding:20px; color:#666;">ไม่มีประวัติ</td></tr>';
        
        myReqs.forEach(r => {
            let badge = r.status === 'pending' ? '⏳ รอตรวจสอบ' : r.status === 'approved' ? '✅ อนุมัติแล้ว' : r.status === 'returned' ? '↩️ คืนแล้ว' : '❌ ไม่ผ่าน';
            tbody.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333">${r.item}</td><td style="padding:10px; border-bottom:1px solid #333">${r.date}</td><td style="padding:10px; border-bottom:1px solid #333">${badge}</td></tr>`;
        });
        document.getElementById('historyModal').style.display = 'flex';
    }
    window.closeHistoryModal = () => document.getElementById('historyModal').style.display = 'none';
    window.filterItems = (cat) => { document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderItems(cat); }
    window.searchItem = (txt) => {
        Array.from(document.getElementsByClassName('card')).forEach(c => {
            c.style.display = c.querySelector('h4').innerText.toLowerCase().includes(txt.toLowerCase()) ? 'flex' : 'none';
        });
    }
}

// ADMIN DASHBOARD
if(window.location.pathname.includes('admin.html')) {
    let currentReqs = [...borrowRequests];

    window.onload = function() {
        checkAuth();
        updateDashboardStats();
        switchTab('requests'); // Default Tab
    }

    window.switchTab = function(tab) {
        document.querySelectorAll('.content-section').forEach(e => e.style.display = 'none');
        document.querySelectorAll('.sidebar-menu a').forEach(e => e.classList.remove('active'));
        document.getElementById(`section-${tab}`).style.display = 'block';
        document.getElementById(`menu-${tab}`).classList.add('active');
        if(tab === 'requests') renderRequests();
        if(tab === 'inventory') renderInventory();
        if(tab === 'users') renderUsers();
    }

    window.renderRequests = function() {
        const tbody = document.getElementById('requestTableBody');
        tbody.innerHTML = '';
        currentReqs.sort((a,b) => (a.status === 'pending' ? -1 : 1));
        currentReqs.forEach(r => {
            let badge, btns;
            if(r.status === 'pending') {
                badge = '<span class="badge status-pending">รอตรวจสอบ</span>';
                btns = `<button class="btn-action btn-approve" onclick="updateStatus(${r.id},'approved')">อนุมัติ</button><button class="btn-action btn-reject" onclick="updateStatus(${r.id},'rejected')">ปฏิเสธ</button>`;
            } else if(r.status === 'approved') {
                badge = '<span class="badge status-approved">ถูกยืม</span>';
                btns = `<button class="btn-action" style="background:#0099cc; color:white" onclick="updateStatus(${r.id},'returned')">รับคืน</button>`;
            } else {
                badge = `<span class="badge" style="background:#333; color:#aaa">${r.status}</span>`;
                btns = '-';
            }
            tbody.innerHTML += `<tr><td>${r.user}</td><td>${r.item}</td><td>${r.date}</td><td>${badge}</td><td>${btns}</td></tr>`;
        });
    }

    window.updateStatus = function(id, status) {
        const req = borrowRequests.find(r => r.id === id);
        if(req) {
            req.status = status;
            saveData();
            currentReqs = [...borrowRequests];
            renderRequests();
            updateDashboardStats();
        }
    }

    window.renderInventory = function() {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';
        items.forEach((item, idx) => {
            const isBorrowed = borrowRequests.some(r => r.item === item.name && r.status === 'approved');
            const status = isBorrowed ? '<span style="color:var(--danger)">ถูกยืม</span>' : '<span style="color:var(--success)">ว่าง</span>';
            tbody.innerHTML += `<tr>
                <td><img src="${item.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover"></td>
                <td style="color:white">${item.name}</td>
                <td><span class="category-tag">${item.category}</span></td>
                <td>${status}</td>
                <td><button onclick="deleteItem(${idx})" class="btn-action btn-reject"><i class="fas fa-trash"></i></button></td>
            </tr>`;
        });
    }

    window.addNewItem = function() {
        const name = prompt("ชื่ออุปกรณ์:");
        if(name) {
            items.push({ id: Date.now(), name: name, category: "general", status: "available", image: "https://placehold.co/100x100/333/ff6600?text=NEW" });
            saveData();
            renderInventory();
            updateDashboardStats();
        }
    }

    window.deleteItem = function(idx) {
        if(confirm("ลบอุปกรณ์นี้?")) { items.splice(idx, 1); saveData(); renderInventory(); updateDashboardStats(); }
    }

    window.renderUsers = function() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        users.forEach(u => {
            const role = u.role === 'admin' ? '<span style="color:var(--theme-primary); border:1px solid var(--theme-primary); padding:2px 6px; border-radius:4px; font-size:10px;">ADMIN</span>' : 'User';
            tbody.innerHTML += `<tr><td style="color:white">${u.name}</td><td>${u.username}</td><td>${role}</td><td><button onclick="banUser('${u.username}')" class="btn-action" style="background:#333; color:#666"><i class="fas fa-ban"></i></button></td></tr>`;
        });
    }

    window.banUser = function(target) {
        if(target.includes('admin') || target.includes('rmuti')) { alert("❌ ลบ Admin ไม่ได้"); return; }
        if(confirm("ลบผู้ใช้นี้?")) {
            users = users.filter(u => u.username !== target);
            saveData();
            renderUsers();
        }
    }

    window.searchRequest = (txt) => {
        currentReqs = txt === '' ? [...borrowRequests] : borrowRequests.filter(r => r.user.toLowerCase().includes(txt.toLowerCase()));
        renderRequests();
    }

    function updateDashboardStats() {
        document.getElementById('stat-pending').innerText = borrowRequests.filter(r => r.status === 'pending').length;
        document.getElementById('stat-borrowed').innerText = borrowRequests.filter(r => r.status === 'approved').length;
        document.getElementById('stat-total-items').innerText = items.length;
    }
}