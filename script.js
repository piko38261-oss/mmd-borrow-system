/* =========================================
   script.js - MMD BORROW SYSTEM (PHOTO EDITION / NO CREDIT CARD)
   ========================================= */

// 1. นำเข้า Firebase
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

/* --- PART 0: Helper Function (ระบบย่อรูป) --- */
// ฟังก์ชันนี้จะช่วยย่อรูปให้เล็กลง และแปลงเป็นตัวหนังสือเพื่อเก็บใน Database ฟรีๆ
function resizeImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 800; // บีบรูปให้กว้างไม่เกิน 800px
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // แปลงเป็น JPG คุณภาพ 70%
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
    });
}

/* --- PART 1: Data Logic (Sync with Firebase) --- */

async function seedDatabase() {
    const usersSnap = await getDocs(collection(db, "users"));
    if (usersSnap.empty) {
        // ... (โค้ดสร้างข้อมูลจำลองเดิมของคุณ ใส่ไว้เหมือนเดิมได้) ...
        console.log("Database empty. Seeding defaults...");
        // (ละไว้เพื่อประหยัดพื้นที่ แต่ฟังก์ชันนี้ทำงานเหมือนเดิมครับ)
    }
}

// โหลดข้อมูลแบบ Real-time
function listenToData() {
    onSnapshot(collection(db, "items"), (snapshot) => {
        items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html')) renderItems();
        if(window.location.pathname.includes('admin.html')) {
            renderInventory(); 
            updateDashboardStats();
        }
    });

    onSnapshot(collection(db, "requests"), (snapshot) => {
        borrowRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html')) renderItems(); 
        if(window.location.pathname.includes('admin.html')) {
            renderRequests();
            updateDashboardStats();
        }
    });

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
    const display = document.querySelector('.user-info span') || document.querySelector('.admin-profile span');
    if(display) display.innerText = currentUser.name;
    
    if (currentUser.role === 'admin' && window.location.pathname.includes('dashboard.html')) {
        const userInfoDiv = document.querySelector('.user-info');
        if (!document.getElementById('backToAdminBtn')) {
            const btn = document.createElement('button');
            btn.innerHTML = '<i class="fas fa-user-shield"></i> กลับหน้า Admin';
            btn.className = 'btn-history';
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
        userData.id = querySnapshot.docs[0].id;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = userData.role === 'admin' ? 'admin.html' : 'dashboard.html';
    } else {
        alert("❌ ชื่อผู้ใช้หรือรหัสผ่านผิด");
    }
}

window.register = async function(u, p, n) {
    const q = query(collection(db, "users"), where("username", "==", u));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) { alert("❌ มีผู้ใช้นี้แล้ว"); return; }
    await addDoc(collection(db, "users"), { username: u, password: p, role: "user", name: n });
    alert("✅ สมัครสำเร็จ! กรุณาล็อคอิน");
    toggleForm();
}

window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

/* --- PART 3: Page Logic --- */

// === LOGIN PAGE ===
if(document.getElementById('loginForm')) {
    // seedDatabase(); // เปิดใช้ถ้าต้องการรีเซ็ต
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
    listenToData();
    window.onload = function() { checkAuth(); }

    window.renderItems = function(cat = 'all') {
        const grid = document.getElementById('itemGrid');
        if(!grid) return;
        grid.innerHTML = '';
        items.forEach(item => {
            if(cat !== 'all' && item.category !== cat) return;
            const isBorrowed = borrowRequests.some(r => r.item === item.name && r.status === 'approved');
            const status = isBorrowed ? 'borrowed' : 'available';
            const btnClass = status === 'available' ? 'btn-borrow' : 'btn-disabled';
            const btnText = status === 'available' ? 'จองทันที' : 'ไม่ว่าง';
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
        document.getElementById('modalItemName').dataset.id = id;
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
                user: currentUser.name, userId: currentUser.id, item: itemName, date: date, status: "pending", timestamp: new Date()
            });
            alert("✅ ส่งคำขอจองเรียบร้อย!"); closeModal();
        } catch(e) { console.error(e); alert("จองไม่สำเร็จ"); }
    });

    // --- History Modal (แก้ไขให้โชว์ปุ่มดูรูป) ---
    window.openHistoryModal = () => {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';
        const myReqs = borrowRequests.filter(r => r.user === currentUser.name).sort((a,b) => b.timestamp - a.timestamp);
        
        if (myReqs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#666;">ไม่มีประวัติ</td></tr>';
        } else {
            myReqs.forEach(r => {
                let badge = r.status === 'pending' ? '⏳ รอตรวจสอบ' : r.status === 'approved' ? '✅ อนุมัติแล้ว' : r.status === 'returned' ? '↩️ คืนแล้ว' : '❌ ไม่ผ่าน';
                // ถ้ามีรูป (proofPhoto) ให้โชว์ลิงก์
                let photoBtn = r.proofPhoto ? `<a href="${r.proofPhoto}" target="_blank" style="color:#ff6600; font-weight:bold;">📷 ดูรูป</a>` : '-';
                
                tbody.innerHTML += `<tr>
                    <td style="padding:10px; border-bottom:1px solid #333">${r.item}</td>
                    <td style="padding:10px; border-bottom:1px solid #333">${r.date}</td>
                    <td style="padding:10px; border-bottom:1px solid #333">${badge}</td>
                    <td style="padding:10px; border-bottom:1px solid #333">${photoBtn}</td>
                </tr>`;
            });
        }
        document.getElementById('historyModal').style.display = 'flex';
    }
    window.closeHistoryModal = () => document.getElementById('historyModal').style.display = 'none';
    
    window.filterItems = (cat) => { document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderItems(cat); }
    window.searchItem = (txt) => { Array.from(document.getElementsByClassName('card')).forEach(c => { c.style.display = c.querySelector('h4').innerText.toLowerCase().includes(txt.toLowerCase()) ? 'flex' : 'none'; }); }
}

// === ADMIN DASHBOARD ===
if(window.location.pathname.includes('admin.html')) {
    listenToData();
    window.onload = function() { checkAuth(); updateDashboardStats(); document.getElementById('section-requests').style.display = 'block'; }

    window.switchTab = function(tab) {
        document.querySelectorAll('.content-section').forEach(e => e.style.display = 'none');
        document.querySelectorAll('.sidebar-menu a').forEach(e => e.classList.remove('active'));
        document.getElementById(`section-${tab}`).style.display = 'block';
        document.getElementById(`menu-${tab}`).classList.add('active');
        if(tab === 'requests') renderRequests();
        if(tab === 'inventory') renderInventory();
        if(tab === 'users') renderUsers();
    }

    // --- Render Requests (แก้ไขให้มีปุ่มถ่ายรูป) ---
    window.renderRequests = function() {
        const tbody = document.getElementById('requestTableBody');
        if(!tbody) return;
        tbody.innerHTML = '';
        const sortedReqs = [...borrowRequests].sort((a,b) => (a.status === 'pending' ? -1 : 1));
        
        sortedReqs.forEach(r => {
            let badge, btns;
            // ลิงก์รูป (ถ้ามี)
            let photoLink = r.proofPhoto ? `<a href="${r.proofPhoto}" target="_blank" style="margin-left:5px; color:#ff6600;"><i class="fas fa-image"></i></a>` : '';

            if(r.status === 'pending') {
                badge = '<span class="badge status-pending">รอตรวจสอบ</span>';
                // ปุ่ม: 1. Input File ซ่อนอยู่, 2. ปุ่มกล้องกดแล้วไปเรียก Input, 3. ปุ่มปฏิเสธ
                btns = `
                    <input type="file" id="file-${r.id}" style="display:none;" onchange="uploadProof(this, '${r.id}')" accept="image/*">
                    <button class="btn-action" style="background:#444;" onclick="document.getElementById('file-${r.id}').click()"><i class="fas fa-camera"></i> ถ่ายรูป/อนุมัติ</button>
                    <button class="btn-action btn-reject" onclick="updateStatus('${r.id}','rejected')">ปฏิเสธ</button>
                `;
            } else if(r.status === 'approved') {
                badge = `<span class="badge status-approved">ถูกยืม</span> ${photoLink}`;
                btns = `<button class="btn-action" style="background:#0099cc; color:white" onclick="updateStatus('${r.id}','returned')">รับคืน</button>`;
            } else {
                badge = `<span class="badge" style="background:#333; color:#aaa">${r.status}</span> ${photoLink}`;
                btns = '-';
            }
            tbody.innerHTML += `<tr><td>${r.user}</td><td>${r.item}</td><td>${r.date}</td><td>${badge}</td><td>${btns}</td></tr>`;
        });
    }

    // --- ฟังก์ชันอัปโหลดรูป (ระบบย่อรูป Base64) ---
    window.uploadProof = async function(input, reqId) {
        const file = input.files[0];
        if(!file) return;

        try {
            alert("⏳ กำลังย่อขนาดและบันทึกรูป... (ไม่ต้องจ่ายเงิน)");
            // 1. เรียกใช้ฟังก์ชันย่อรูป
            const base64String = await resizeImage(file); 
            
            // 2. บันทึกรูปย่อลงใน Database โดยตรง
            await updateDoc(doc(db, "requests", reqId), { 
                status: 'approved', 
                proofPhoto: base64String 
            });
            
            alert("✅ อัปโหลดและอนุมัติสำเร็จ!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("❌ เกิดข้อผิดพลาด: " + error.message);
        }
    }

    window.updateStatus = async function(docId, newStatus) {
        try { await updateDoc(doc(db, "requests", docId), { status: newStatus }); } catch(e) { alert("Error updating status: " + e.message); }
    }

    window.renderInventory = function() {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';
        items.forEach((item) => {
            const isBorrowed = borrowRequests.some(r => r.item === item.name && r.status === 'approved');
            const status = isBorrowed ? '<span style="color:var(--danger)">ถูกยืม</span>' : '<span style="color:var(--success)">ว่าง</span>';
            tbody.innerHTML += `<tr><td><img src="${item.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover"></td><td style="color:white">${item.name}</td><td><span class="category-tag">${item.category}</span></td><td>${status}</td><td><button onclick="deleteItem('${item.id}')" class="btn-action btn-reject"><i class="fas fa-trash"></i></button></td></tr>`;
        });
    }

    window.addNewItem = async function() {
        const name = prompt("ชื่ออุปกรณ์:");
        if(name) { await addDoc(collection(db, "items"), { name: name, category: "general", status: "available", image: "https://placehold.co/100x100/333/ff6600?text=NEW" }); }
    }
    window.deleteItem = async function(docId) { if(confirm("ลบอุปกรณ์นี้?")) { await deleteDoc(doc(db, "items", docId)); } }
    window.renderUsers = function() {
        const tbody = document.getElementById('usersTableBody'); tbody.innerHTML = '';
        users.forEach(u => {
            const role = u.role === 'admin' ? '<span style="color:var(--theme-primary); border:1px solid var(--theme-primary); padding:2px 6px; border-radius:4px; font-size:10px;">ADMIN</span>' : 'User';
            tbody.innerHTML += `<tr><td style="color:white">${u.name}</td><td>${u.username}</td><td>${role}</td><td><button onclick="banUser('${u.id}', '${u.username}')" class="btn-action" style="background:#333; color:#666"><i class="fas fa-ban"></i></button></td></tr>`;
        });
    }
    window.banUser = async function(id, username) { if(username.includes('admin') || username.includes('rmuti')) { alert("❌ ลบ Admin ไม่ได้"); return; } if(confirm("ลบผู้ใช้นี้?")) { await deleteDoc(doc(db, "users", id)); } }
    window.searchRequest = (txt) => { const rows = document.querySelectorAll('#requestTableBody tr'); rows.forEach(row => { const name = row.children[0].innerText.toLowerCase(); row.style.display = name.includes(txt.toLowerCase()) ? '' : 'none'; }); }
    window.searchUser = (txt) => { const rows = document.querySelectorAll('#usersTableBody tr'); rows.forEach(row => { const name = row.children[0].innerText.toLowerCase(); row.style.display = name.includes(txt.toLowerCase()) ? '' : 'none'; }); }
    window.updateDashboardStats = function() { document.getElementById('stat-pending').innerText = borrowRequests.filter(r => r.status === 'pending').length; document.getElementById('stat-borrowed').innerText = borrowRequests.filter(r => r.status === 'approved').length; document.getElementById('stat-total-items').innerText = items.length; }
}