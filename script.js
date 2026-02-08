/* =========================================
   script.js - MMD BORROW SYSTEM (FULL EDITION + EMAIL ALERT)
   ========================================= */

// 1. นำเข้า Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where, writeBatch } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. การตั้งค่า (Config)
const firebaseConfig = {
  apiKey: "AIzaSyCJNX3-vN5bceDczdKxrqb0N8uaBpgDhTE",
  authDomain: "mmd-borrow-app.firebaseapp.com",
  projectId: "mmd-borrow-app",
  storageBucket: "mmd-borrow-app.firebasestorage.app",
  messagingSenderId: "525869633986",
  appId: "1:525869633986:web:ed7a1cbdaa038a098e065b",
  measurementId: "G-G4PV2T14DK"
};

// 3. เริ่มต้นระบบ
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* --- Global Variables --- */
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let items = [];
let borrowRequests = [];
let users = [];

/* --- Helper 1: ระบบย่อรูป --- */
function resizeImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 800; 
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
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
    });
}

/* --- Helper 2: ระบบ Popup ดูรูป --- */
const lightbox = document.createElement('div');
lightbox.id = 'lightbox-modal';
lightbox.style.cssText = 'display:none; position:fixed; z-index:99999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); justify-content:center; align-items:center; cursor:pointer; flex-direction:column;';
lightbox.innerHTML = `
    <img id="lightbox-img" style="max-width:90%; max-height:85%; border:2px solid white; box-shadow:0 0 20px black; object-fit:contain;">
    <p style="color:white; margin-top:10px; font-family:sans-serif;">แตะที่ว่างเพื่อปิด</p>
`;
lightbox.onclick = () => lightbox.style.display = 'none';
document.body.appendChild(lightbox);

window.viewPhoto = function(reqId) {
    const req = borrowRequests.find(r => r.id === reqId);
    if (req && req.proofPhoto) {
        document.getElementById('lightbox-img').src = req.proofPhoto;
        document.getElementById('lightbox-modal').style.display = 'flex';
    } else {
        alert("ไม่พบรูปภาพ");
    }
}

/* --- PART 1: Data Logic --- */
function listenToData() {
    onSnapshot(collection(db, "items"), (snapshot) => {
        items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html')) renderItems();
        if(window.location.pathname.includes('admin.html')) { renderInventory(); updateDashboardStats(); }
    });

    onSnapshot(collection(db, "requests"), (snapshot) => {
        borrowRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html')) renderItems(); 
        if(window.location.pathname.includes('admin.html')) { renderRequests(); updateDashboardStats(); }
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
        const ui = document.querySelector('.user-info');
        if (!document.getElementById('backToAdminBtn')) {
            const btn = document.createElement('button');
            btn.innerHTML = '<i class="fas fa-user-shield"></i> กลับหน้า Admin';
            btn.className = 'btn-history'; btn.style.marginRight = '10px';
            btn.onclick = () => window.location.href = 'admin.html';
            ui.insertBefore(btn, ui.firstChild);
        }
    }
    return currentUser;
}
window.login = async function(u, p) {
    const q = query(collection(db, "users"), where("username", "==", u), where("password", "==", p));
    const qs = await getDocs(q);
    if (!qs.empty) {
        const d = qs.docs[0].data(); d.id = qs.docs[0].id;
        localStorage.setItem('currentUser', JSON.stringify(d));
        window.location.href = d.role === 'admin' ? 'admin.html' : 'dashboard.html';
    } else { alert("❌ ชื่อผู้ใช้หรือรหัสผ่านผิด"); }
}
window.register = async function(u, p, n) {
    const q = query(collection(db, "users"), where("username", "==", u));
    if (!(await getDocs(q)).empty) { alert("❌ มีผู้ใช้นี้แล้ว"); return; }
    await addDoc(collection(db, "users"), { username: u, password: p, role: "user", name: n });
    alert("✅ สมัครสำเร็จ!"); toggleForm();
}
window.logout = () => { localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }

/* --- PART 3: Page Logic --- */
if(document.getElementById('loginForm')) {
    window.toggleForm = () => { document.getElementById('loginForm').classList.toggle('hidden'); document.getElementById('registerForm').classList.toggle('hidden'); }
    document.getElementById('loginForm').onsubmit = (e) => { e.preventDefault(); login(document.getElementById('username').value, document.getElementById('password').value); };
    document.getElementById('registerForm').onsubmit = (e) => { e.preventDefault(); register(document.getElementById('regUser').value, document.getElementById('regPass').value, document.getElementById('regName').value); };
}

// === USER DASHBOARD ===
if(window.location.pathname.includes('dashboard.html')) {
    listenToData(); window.onload = () => checkAuth();
    window.renderItems = (cat = 'all') => {
        const grid = document.getElementById('itemGrid'); if(!grid) return; grid.innerHTML = '';
        items.forEach(item => {
            if(cat !== 'all' && item.category !== cat) return;
            const isBorrowed = borrowRequests.some(r => r.item === item.name && r.status === 'approved');
            const status = isBorrowed ? 'borrowed' : 'available';
            const btnClass = status === 'available' ? 'btn-borrow' : 'btn-disabled';
            const btnText = status === 'available' ? 'จองทันที' : 'ไม่ว่าง';
            const btnAction = status === 'available' ? `openModal('${item.name}', '${item.id}')` : '';
            grid.innerHTML += `<div class="card"><div class="card-img"><img src="${item.image}"><div class="status-badge ${status}">${status==='available'?'ว่าง':'ถูกยืม'}</div></div><div class="card-body"><h4>${item.name}</h4><span class="category-tag">${item.category.toUpperCase()}</span><button class="${btnClass}" onclick="${btnAction}">${btnText}</button></div></div>`;
        });
    }
    window.openModal = (n, id) => { 
        document.getElementById('modalItemName').innerText = n; 
        document.getElementById('modalItemName').dataset.id = id; 
        document.getElementById('borrowerName').value = currentUser.name; 
        document.getElementById('borrowModal').style.display = 'flex'; 
    }
    window.closeModal = () => document.getElementById('borrowModal').style.display = 'none';

    // ✅ ฟังก์ชันกดจอง + ส่งอีเมลแจ้งเตือน
    document.getElementById('borrowForm').onsubmit = async (e) => {
        e.preventDefault();
        const itemName = document.getElementById('modalItemName').innerText;
        const date = document.querySelector('input[type="date"]').value;
        const fileInput = document.getElementById('borrowProof');

        try {
            alert("⏳ กำลังบันทึกและส่งแจ้งเตือน...");
            let photoBase64 = null;
            if (fileInput.files.length > 0) { photoBase64 = await resizeImage(fileInput.files[0]); }

            // 1. บันทึกลง Firebase
            await addDoc(collection(db, "requests"), { 
                user: currentUser.name, userId: currentUser.id, item: itemName, date: date, 
                status: "pending", 
                proofPhoto: photoBase64,
                timestamp: new Date() 
            });
            
            // 2. ส่ง Email ไปหาแอดมิน (piko38261@gmail.com)
            const emailParams = {
                user_name: currentUser.name,
                item_name: itemName,
                date: date,
                to_email: "piko38261@gmail.com"
            };

            // ✅ ใส่รหัสจริงให้แล้วครับ!
            emailjs.send('service_8q17oo9', 'template_4ch9467', emailParams)
                .then(function() {
                    console.log('✅ แจ้งเตือนเข้าเมลสำเร็จ!');
                }, function(error) {
                    console.log('❌ แจ้งเตือนเมลล้มเหลว...', error);
                });

            alert("✅ จองสำเร็จ! แจ้งเตือนแอดมินเรียบร้อย"); 
            closeModal();
            fileInput.value = ''; 
        } catch(e) { alert("Error: " + e.message); }
    };

    window.openHistoryModal = () => {
        const tbody = document.getElementById('historyTableBody'); tbody.innerHTML = '';
        const myReqs = borrowRequests.filter(r => r.user === currentUser.name).sort((a,b) => {
             const tA = a.timestamp && a.timestamp.seconds ? a.timestamp.seconds : 0;
             const tB = b.timestamp && b.timestamp.seconds ? b.timestamp.seconds : 0;
             return tB - tA;
        });

        if (myReqs.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">ไม่มีประวัติ</td></tr>';
        else myReqs.forEach(r => {
            let badge = r.status==='pending'?'⏳ รอตรวจสอบ':r.status==='approved'?'✅ อนุมัติแล้ว':r.status==='returned'?'↩️ คืนแล้ว':'❌ ไม่ผ่าน';
            let photoBtn = r.proofPhoto ? `<button onclick="viewPhoto('${r.id}')" style="background:none; border:none; color:var(--theme-primary); cursor:pointer; font-weight:bold; text-decoration:underline;">📷 ดูรูป</button>` : '-';
            tbody.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333">${r.item}</td><td style="padding:10px; border-bottom:1px solid #333">${r.date}</td><td style="padding:10px; border-bottom:1px solid #333">${badge}</td><td style="padding:10px; border-bottom:1px solid #333">${photoBtn}</td></tr>`;
        });
        document.getElementById('historyModal').style.display = 'flex';
    }
    window.closeHistoryModal = () => document.getElementById('historyModal').style.display = 'none';
    window.filterItems = (cat) => { document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderItems(cat); }
    window.searchItem = (t) => { Array.from(document.getElementsByClassName('card')).forEach(c => c.style.display = c.querySelector('h4').innerText.toLowerCase().includes(t.toLowerCase()) ? 'flex' : 'none'); }
}

// === ADMIN DASHBOARD ===
if(window.location.pathname.includes('admin.html')) {
    listenToData(); window.onload = () => { checkAuth(); updateDashboardStats(); document.getElementById('section-requests').style.display = 'block'; }
    window.switchTab = (t) => { document.querySelectorAll('.content-section').forEach(e => e.style.display = 'none'); document.querySelectorAll('.sidebar-menu a').forEach(e => e.classList.remove('active')); document.getElementById(`section-${t}`).style.display = 'block'; document.getElementById(`menu-${t}`).classList.add('active'); if(t==='requests') renderRequests(); if(t==='inventory') renderInventory(); if(t==='users') renderUsers(); }

    window.renderRequests = () => {
        const tbody = document.getElementById('requestTableBody'); if(!tbody) return; tbody.innerHTML = '';
        const sortedReqs = [...borrowRequests].sort((a,b) => {
             const tA = a.timestamp && a.timestamp.seconds ? a.timestamp.seconds : 0;
             const tB = b.timestamp && b.timestamp.seconds ? b.timestamp.seconds : 0;
             return tB - tA;
        });

        sortedReqs.forEach(r => {
            let badge, btns, photoDisplay;

            if (r.proofPhoto) {
                photoDisplay = `<button onclick="viewPhoto('${r.id}')" style="background:none; border:none; color:#ff6600; cursor:pointer; font-weight:bold; text-decoration:underline;">📷 รูปแนบ</button>`;
            } else { photoDisplay = '-'; }

            if(r.status === 'pending') {
                badge = '<span class="badge status-pending">รอตรวจสอบ</span>';
                if(r.proofPhoto) {
                    btns = `<button class="btn-action" style="background:#28a745;" onclick="updateStatus('${r.id}','approved')">✅ อนุมัติ</button>
                            <button class="btn-action btn-reject" onclick="updateStatus('${r.id}','rejected')">ปฏิเสธ</button>`;
                } else {
                    btns = `<input type="file" id="file-${r.id}" style="display:none;" onchange="uploadProof(this, '${r.id}')" accept="image/*">
                            <button class="btn-action" style="background:#444;" onclick="document.getElementById('file-${r.id}').click()"><i class="fas fa-camera"></i> ถ่ายรูป</button>
                            <button class="btn-action btn-reject" onclick="updateStatus('${r.id}','rejected')">ปฏิเสธ</button>`;
                }
            } else if(r.status === 'approved') {
                badge = '<span class="badge status-approved">ถูกยืม</span>';
                btns = `<button class="btn-action" style="background:#0099cc; color:white" onclick="updateStatus('${r.id}','returned')">รับคืน</button>`;
            } else { 
                badge = `<span class="badge" style="background:#333; color:#aaa">${r.status}</span>`; 
                btns = `<button class="btn-action btn-reject" onclick="deleteRequest('${r.id}')" title="ลบประวัตินี้"><i class="fas fa-trash"></i></button>`; 
            }
            tbody.innerHTML += `<tr><td>${r.user}</td><td>${r.item}</td><td>${r.date}</td><td>${badge}</td><td>${photoDisplay}</td><td>${btns}</td></tr>`;
        });
    }

    window.deleteRequest = async (id) => {
        if(confirm("⚠️ คุณต้องการลบประวัติคำขอนี้ใช่หรือไม่?\n(ข้อมูลจะหายไปถาวร)")) {
            try { await deleteDoc(doc(db, "requests", id)); } catch(e) { alert("❌ ลบไม่สำเร็จ: " + e.message); }
        }
    }

    window.uploadProof = async (input, reqId) => {
        const file = input.files[0]; if(!file) return;
        try {
            alert("⏳ กำลังบันทึกรูป...");
            const base64String = await resizeImage(file); 
            await updateDoc(doc(db, "requests", reqId), { status: 'approved', proofPhoto: base64String });
            alert("✅ สำเร็จ!");
        } catch (error) { alert("❌ ผิดพลาด: " + error.message); }
    }

    window.updateStatus = async (id, s) => { try { await updateDoc(doc(db, "requests", id), { status: s }); } catch(e) { alert("Error"); } }
    window.renderInventory = () => { const tbody = document.getElementById('inventoryTableBody'); tbody.innerHTML = ''; items.forEach(i => { const st = borrowRequests.some(r => r.item === i.name && r.status === 'approved') ? '<span style="color:var(--danger)">ถูกยืม</span>' : '<span style="color:var(--success)">ว่าง</span>'; tbody.innerHTML += `<tr><td><img src="${i.image}" width="40"></td><td style="color:white">${i.name}</td><td>${i.category}</td><td>${st}</td><td><button onclick="deleteItem('${i.id}')" class="btn-action btn-reject"><i class="fas fa-trash"></i></button></td></tr>`; }); }
    window.addNewItem = async () => { const n = prompt("ชื่อ:"); if(n) await addDoc(collection(db, "items"), { name: n, category: "general", status: "available", image: "https://placehold.co/100" }); }
    window.deleteItem = async (id) => { if(confirm("ลบ?")) await deleteDoc(doc(db, "items", id)); }
    window.renderUsers = () => { const tbody = document.getElementById('usersTableBody'); tbody.innerHTML = ''; users.forEach(u => { tbody.innerHTML += `<tr><td style="color:white">${u.name}</td><td>${u.username}</td><td>${u.role}</td><td><button onclick="banUser('${u.id}', '${u.username}')" class="btn-action" style="background:#333; color:#666">Ban</button></td></tr>`; }); }
    window.banUser = async (id, u) => { if(u.includes('admin')||u.includes('rmuti')) return; if(confirm("ลบ?")) await deleteDoc(doc(db, "users", id)); }
    window.searchRequest = (t) => { document.querySelectorAll('#requestTableBody tr').forEach(r => r.style.display = r.children[0].innerText.toLowerCase().includes(t.toLowerCase()) ? '' : 'none'); }
    window.searchUser = (t) => { document.querySelectorAll('#usersTableBody tr').forEach(r => r.style.display = r.children[0].innerText.toLowerCase().includes(t.toLowerCase()) ? '' : 'none'); }
    window.updateDashboardStats = () => { document.getElementById('stat-pending').innerText = borrowRequests.filter(r => r.status === 'pending').length; document.getElementById('stat-borrowed').innerText = borrowRequests.filter(r => r.status === 'approved').length; document.getElementById('stat-total-items').innerText = items.length; }
}