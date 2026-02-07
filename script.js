/* =========================================
   script.js - MMD BORROW SYSTEM (ONLINE / FIREBASE EDITION)
   ========================================= */

// 1. นำเข้า Firebase (ดึงมาจาก Server ของ Google โดยตรง)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where, writeBatch } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. การตั้งค่า (Config) ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyCJNX3-vN5bceDczdKxrqb0N8uaBpgDhTE",
  authDomain: "mmd-borrow-app.firebaseapp.com",
  projectId: "mmd-borrow-app",
  storageBucket: "mmd-borrow-app.firebasestorage.app",
  messagingSenderId: "525869633986",
  appId: "1:525869633986:web:ed7a1cbdaa038a098e065b",
  measurementId: "G-G4PV2T14DK"
};

// 3. เริ่มต้นระบบ Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* --- Global Variables --- */
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let items = [];
let borrowRequests = [];
let users = [];

/* --- PART 1: Data Logic (Sync with Firebase) --- */

// ฟังก์ชันสร้างข้อมูลเริ่มต้น (ถ้าฐานข้อมูลว่างเปล่า)
async function seedDatabase() {
    const usersSnap = await getDocs(collection(db, "users"));
    if (usersSnap.empty) {
        console.log("Database empty. Seeding defaults...");
        const batch = writeBatch(db);
        
        // สร้าง Admin
        const adminRef = doc(collection(db, "users"));
        batch.set(adminRef, { username: "phongphiphat.pr@rmuti.ac.th", password: "0624960871kopiko", role: "admin", name: "Phongphiphat (Admin)" });
        const adminRef2 = doc(collection(db, "users"));
        batch.set(adminRef2, { username: "admin", password: "123", role: "admin", name: "Super Admin" });

        // สร้างอุปกรณ์
        const defaultItems = [
            { name: "Canon EOS R5", category: "camera", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Canon+EOS+R5" },
            { name: "Sony A7 IV", category: "camera", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Sony+A7+IV" },
            { name: "Manfrotto 055", category: "tripod", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Manfrotto" },
            { name: "Rode VideoMic", category: "audio", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Rode+Mic" },
            { name: "Aputure 120d", category: "light", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Aputure+Light" },
            { name: "GoPro Hero 11", category: "camera", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=GoPro+11" },
            { name: "DJI Ronin RS3", category: "tripod", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=DJI+Gimbal" },
            { name: "Zoom H6", category: "audio", status: "available", image: "https://placehold.co/400x300/1a1a1a/ff6600?text=Zoom+H6" }
        ];

        defaultItems.forEach(item => {
            const itemRef = doc(collection(db, "items"));
            batch.set(itemRef, item);
        });

        await batch.commit();
        console.log("Seeding complete!");
        alert("✅ สร้างฐานข้อมูลเริ่มต้นสำเร็จ! กรุณาล็อคอิน");
        window.location.reload();
    }
}

// โหลดข้อมูลแบบ Real-time (ใครกดจอง เครื่องอื่นเห็นด้วยทันที)
function listenToData() {
    // ฟังข้อมูลอุปกรณ์ (Items)
    onSnapshot(collection(db, "items"), (snapshot) => {
        items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html')) renderItems();
        if(window.location.pathname.includes('admin.html')) {
            renderInventory(); 
            updateDashboardStats();
        }
    });

    // ฟังข้อมูลคำขอ (Requests)
    onSnapshot(collection(db, "requests"), (snapshot) => {
        borrowRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html')) renderItems(); // อัปเดตสถานะปุ่มจอง
        if(window.location.pathname.includes('admin.html')) {
            renderRequests();
            updateDashboardStats();
        }
    });

    // ฟังข้อมูลสมาชิก (Users)
    if(window.location.pathname.includes('admin.html')) {
        onSnapshot(collection(db, "users"), (snapshot) => {
            users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderUsers();
        });
    }
}

/* --- PART 2: Auth System --- */
window.checkAuth = function() {
    if (!currentUser) { window.location.href = 'index.html'; return null; }
    
    // แสดงชื่อ
    const display = document.querySelector('.user-info span') || document.querySelector('.admin-profile span');
    if(display) display.innerText = currentUser.name;
    
    // ปุ่มกลับหน้า Admin
    if (currentUser.role === 'admin' && window.location.pathname.includes('dashboard.html')) {
        const userInfoDiv = document.querySelector('.user-info');
        if (!document.getElementById('backToAdminBtn')) {
            const btn = document.createElement('button');
            btn.innerHTML = '<i class="fas fa-user-shield"></i> กลับหน้า Admin';
            btn.className = 'btn-history'; // ใช้สไตล์เดิม
            btn.style.marginRight = '10px';
            btn.onclick = function() { window.location.href = 'admin.html'; };
            userInfoDiv.insertBefore(btn, userInfoDiv.firstChild);
        }
    }
    return currentUser;
}

window.login = async function(u, p) {
    const q = query(collection(db, "users"), where("username", "==", u), where("password", "==", p));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        userData.id = querySnapshot.docs[0].id; // เก็บ ID ไว้ใช้อ้างอิง
        localStorage.setItem('currentUser', JSON.stringify(userData));
        alert(`ยินดีต้อนรับ ${userData.name}`);
        window.location.href = userData.role === 'admin' ? 'admin.html' : 'dashboard.html';
    } else {
        alert("❌ ชื่อผู้ใช้หรือรหัสผ่านผิด");
    }
}

window.register = async function(u, p, n) {
    // เช็คก่อนว่าซ้ำไหม
    const q = query(collection(db, "users"), where("username", "==", u));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        alert("❌ มีผู้ใช้นี้แล้ว");
        return;
    }

    try {
        await addDoc(collection(db, "users"), { username: u, password: p, role: "user", name: n });
        alert("✅ สมัครสำเร็จ! กรุณาล็อคอิน");
        toggleForm();
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("เกิดข้อผิดพลาดในการสมัคร");
    }
}

window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

/* --- PART 3: Page Logic --- */

// === LOGIN PAGE ===
if(document.getElementById('loginForm')) {
    // เรียกใช้ seedDatabase เพื่อสร้างข้อมูลเริ่มต้นถ้ายังไม่มี
    seedDatabase();

    window.toggleForm = function() {
        document.getElementById('loginForm').classList.toggle('hidden');
        document.getElementById('registerForm').classList.toggle('hidden');
    }

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        login(document.getElementById('username').value, document.getElementById('password').value);
    });

    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        register(document.getElementById('regUser').value, document.getElementById('regPass').value, document.getElementById('regName').value);
    });
}

// === USER DASHBOARD ===
if(window.location.pathname.includes('dashboard.html')) {
    listenToData(); // เริ่มฟังข้อมูล Real-time
    window.onload = function() { checkAuth(); }

    window.renderItems = function(cat = 'all') {
        const grid = document.getElementById('itemGrid');
        if(!grid) return;
        grid.innerHTML = '';

        items.forEach(item => {
            if(cat !== 'all' && item.category !== cat) return;
            
            // เช็คสถานะจากการจอง (ถ้า Approved = ไม่ว่าง)
            const isBorrowed = borrowRequests.some(r => r.item === item.name && r.status === 'approved');
            const status = isBorrowed ? 'borrowed' : 'available';
            const btnClass = status === 'available' ? 'btn-borrow' : 'btn-disabled';
            const btnText = status === 'available' ? 'จองทันที' : 'ไม่ว่าง';
            
            // ต้องส่ง item.id ไปด้วยเพื่อใช้อ้างอิงตอนจอง
            const btnAction = status === 'available' ? `openModal('${item.name}', '${item.id}')` : '';

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

    window.openModal = function(name, id) {
        document.getElementById('modalItemName').innerText = name;
        document.getElementById('modalItemName').dataset.id = id; // แอบเก็บ ID ไว้
        document.getElementById('borrowerName').value = currentUser.name;
        document.getElementById('borrowModal').style.display = 'flex';
    }
    window.closeModal = () => document.getElementById('borrowModal').style.display = 'none';

    document.getElementById('borrowForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const itemName = document.getElementById('modalItemName').innerText;
        const date = document.querySelector('input[type="date"]').value;
        
        try {
            await addDoc(collection(db, "requests"), {
                user: currentUser.name,
                userId: currentUser.id,
                item: itemName,
                date: date,
                status: "pending",
                timestamp: new Date()
            });
            alert("✅ ส่งคำขอจองเรียบร้อย!");
            closeModal();
        } catch(e) {
            console.error(e);
            alert("จองไม่สำเร็จ");
        }
    });

    // History Modal
    window.openHistoryModal = () => {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';
        
        // กรองเฉพาะของตัวเอง
        const myReqs = borrowRequests.filter(r => r.user === currentUser.name).sort((a,b) => b.timestamp - a.timestamp);
        
        if (myReqs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#666;">ไม่มีประวัติ</td></tr>';
        } else {
            myReqs.forEach(r => {
                let badge = r.status === 'pending' ? '⏳ รอตรวจสอบ' : r.status === 'approved' ? '✅ อนุมัติแล้ว' : r.status === 'returned' ? '↩️ คืนแล้ว' : '❌ ไม่ผ่าน';
                tbody.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333">${r.item}</td><td style="padding:10px; border-bottom:1px solid #333">${r.date}</td><td style="padding:10px; border-bottom:1px solid #333">${badge}</td></tr>`;
            });
        }
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

// === ADMIN DASHBOARD ===
if(window.location.pathname.includes('admin.html')) {
    listenToData();
    window.onload = function() { 
        checkAuth(); 
        updateDashboardStats();
        // เริ่มต้นที่ Tab Requests
        document.getElementById('section-requests').style.display = 'block';
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
        if(!tbody) return;
        tbody.innerHTML = '';
        
        // เรียง Pending ขึ้นก่อน
        const sortedReqs = [...borrowRequests].sort((a,b) => (a.status === 'pending' ? -1 : 1));
        
        sortedReqs.forEach(r => {
            let badge, btns;
            if(r.status === 'pending') {
                badge = '<span class="badge status-pending">รอตรวจสอบ</span>';
                btns = `<button class="btn-action btn-approve" onclick="updateStatus('${r.id}','approved')">อนุมัติ</button><button class="btn-action btn-reject" onclick="updateStatus('${r.id}','rejected')">ปฏิเสธ</button>`;
            } else if(r.status === 'approved') {
                badge = '<span class="badge status-approved">ถูกยืม</span>';
                btns = `<button class="btn-action" style="background:#0099cc; color:white" onclick="updateStatus('${r.id}','returned')">รับคืน</button>`;
            } else {
                badge = `<span class="badge" style="background:#333; color:#aaa">${r.status}</span>`;
                btns = '-';
            }
            tbody.innerHTML += `<tr><td>${r.user}</td><td>${r.item}</td><td>${r.date}</td><td>${badge}</td><td>${btns}</td></tr>`;
        });
    }

    window.updateStatus = async function(docId, newStatus) {
        try {
            await updateDoc(doc(db, "requests", docId), { status: newStatus });
        } catch(e) {
            alert("Error updating status: " + e.message);
        }
    }

    window.renderInventory = function() {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';
        items.forEach((item) => {
            const isBorrowed = borrowRequests.some(r => r.item === item.name && r.status === 'approved');
            const status = isBorrowed ? '<span style="color:var(--danger)">ถูกยืม</span>' : '<span style="color:var(--success)">ว่าง</span>';
            tbody.innerHTML += `<tr>
                <td><img src="${item.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover"></td>
                <td style="color:white">${item.name}</td>
                <td><span class="category-tag">${item.category}</span></td>
                <td>${status}</td>
                <td><button onclick="deleteItem('${item.id}')" class="btn-action btn-reject"><i class="fas fa-trash"></i></button></td>
            </tr>`;
        });
    }

    window.addNewItem = async function() {
        const name = prompt("ชื่ออุปกรณ์:");
        if(name) {
            await addDoc(collection(db, "items"), {
                name: name,
                category: "general",
                status: "available",
                image: "https://placehold.co/100x100/333/ff6600?text=NEW"
            });
        }
    }

    window.deleteItem = async function(docId) {
        if(confirm("ลบอุปกรณ์นี้?")) {
            await deleteDoc(doc(db, "items", docId));
        }
    }

    window.renderUsers = function() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        users.forEach(u => {
            const role = u.role === 'admin' ? '<span style="color:var(--theme-primary); border:1px solid var(--theme-primary); padding:2px 6px; border-radius:4px; font-size:10px;">ADMIN</span>' : 'User';
            tbody.innerHTML += `<tr><td style="color:white">${u.name}</td><td>${u.username}</td><td>${role}</td><td><button onclick="banUser('${u.id}', '${u.username}')" class="btn-action" style="background:#333; color:#666"><i class="fas fa-ban"></i></button></td></tr>`;
        });
    }

    window.banUser = async function(id, username) {
        if(username.includes('admin') || username.includes('rmuti')) { alert("❌ ลบ Admin ไม่ได้"); return; }
        if(confirm("ลบผู้ใช้นี้?")) {
            await deleteDoc(doc(db, "users", id));
        }
    }

    window.searchRequest = (txt) => {
        // ใช้การกรองหน้าบ้าน (Client-side filter) เพราะข้อมูลโหลดมาแล้ว
        const rows = document.querySelectorAll('#requestTableBody tr');
        rows.forEach(row => {
            const name = row.children[0].innerText.toLowerCase();
            row.style.display = name.includes(txt.toLowerCase()) ? '' : 'none';
        });
    }
    
    window.searchUser = (txt) => {
        const rows = document.querySelectorAll('#usersTableBody tr');
        rows.forEach(row => {
            const name = row.children[0].innerText.toLowerCase();
            row.style.display = name.includes(txt.toLowerCase()) ? '' : 'none';
        });
    }

    window.updateDashboardStats = function() {
        document.getElementById('stat-pending').innerText = borrowRequests.filter(r => r.status === 'pending').length;
        document.getElementById('stat-borrowed').innerText = borrowRequests.filter(r => r.status === 'approved').length;
        document.getElementById('stat-total-items').innerText = items.length;
    }
}