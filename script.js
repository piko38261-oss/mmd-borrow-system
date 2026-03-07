/* =========================================
   script.js - MMD BORROW SYSTEM (PREVENT DOUBLE BOOKING + CART)
   ========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

try { emailjs.init("Rj2WpB-v7fZqvEu08"); } catch (e) { console.warn("⚠️ EmailJS ยังไม่ถูกโหลด"); }

const LINE_API_URL = "https://script.google.com/macros/s/AKfycbzw0gLpeZEdB8rUofNdPTLKHBQYhfcYcD1S72t_PRI-tSfdfi2-ZqGUw-Hwa4wRP17crg/exec";

// 🔴 ใส่ Config ของคุณกายตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyCJNX3-vN5bceDczdKxrqb0N8uaBpgDhTE",
  authDomain: "mmd-borrow-app.firebaseapp.com",
  projectId: "mmd-borrow-app",
  storageBucket: "mmd-borrow-app.firebasestorage.app",
  messagingSenderId: "525869633986",
  appId: "1:525869633986:web:ed7a1cbdaa038a098e065b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* --- Global Variables --- */
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let items = [];
let borrowRequests = [];
let users = [];
let cart = []; 
let currentPickupId = null;

/* --- Helpers --- */
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
                let width = img.width, height = img.height;
                if (width > maxWidth) { height = height * (maxWidth / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
    });
}

const lightbox = document.createElement('div');
lightbox.id = 'lightbox-modal';
lightbox.style.cssText = 'display:none; position:fixed; z-index:99999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); justify-content:center; align-items:center; cursor:pointer; flex-direction:column;';
lightbox.innerHTML = `<img id="lightbox-img" style="max-width:90%; max-height:85%; border:2px solid white; box-shadow:0 0 20px black; object-fit:contain;"><p style="color:white; margin-top:10px;">แตะที่ว่างเพื่อปิด</p>`;
lightbox.onclick = () => lightbox.style.display = 'none';
document.body.appendChild(lightbox);

window.viewPhoto = function(reqId) {
    const req = borrowRequests.find(r => r.id === reqId);
    if (req && req.proofPhoto) {
        document.getElementById('lightbox-img').src = req.proofPhoto;
        document.getElementById('lightbox-modal').style.display = 'flex';
    } else {
        Swal.fire({ icon: 'info', title: 'ไม่พบรูปภาพ', text: 'รายการนี้ยังไม่มีรูปภาพหลักฐาน' });
    }
}

/* ==========================================
   🔥 AUTHENTICATION SYSTEM 🔥
   ========================================== */
window.checkAuth = function() {
    if (!currentUser) { 
        if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html'; 
        }
        return null; 
    }
    
    const display = document.getElementById('userNameDisplay');
    if(display) display.innerText = currentUser.name || currentUser.username;
    
    const btnAdminManage = document.getElementById('btnAdminManage');
    if (btnAdminManage) {
        btnAdminManage.style.display = currentUser.role === 'admin' ? 'inline-flex' : 'none';
    }
    return currentUser;
}

window.login = async function(u, p) {
    Swal.fire({ title: 'กำลังเข้าสู่ระบบ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
    try {
        const q = query(collection(db, "users"), where("username", "==", u), where("password", "==", p));
        const qs = await getDocs(q);
        if (!qs.empty) {
            const d = qs.docs[0].data(); d.id = qs.docs[0].id;
            localStorage.setItem('currentUser', JSON.stringify(d));
            await Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'ยินดีต้อนรับคุณ ' + (d.name || d.username), timer: 1500, showConfirmButton: false });
            window.location.href = 'dashboard.html';
        } else { 
            Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบล้มเหลว', text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
    } catch (error) { Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message }); }
}

window.register = async function(u, p, n) {
    try {
        const q = query(collection(db, "users"), where("username", "==", u));
        if (!(await getDocs(q)).empty) { Swal.fire({ icon: 'warning', title: 'สมัครไม่ได้', text: 'มีชื่อผู้ใช้นี้ในระบบแล้ว' }); return; }
        await addDoc(collection(db, "users"), { username: u, password: p, role: "user", name: n });
        Swal.fire({ icon: 'success', title: 'สมัครสำเร็จ!', text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่', timer: 2000, showConfirmButton: false });
        if(window.toggleForm) window.toggleForm();
    } catch (e) { Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: e.message }); }
}

window.logout = () => { 
    Swal.fire({ title: 'ออกจากระบบ?', icon: 'question', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'ออกจากระบบ', cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) { localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }
    });
}

/* ==========================================
   🔥 DATA FETCHING 🔥
   ========================================== */
window.listenToData = function() {
    onSnapshot(collection(db, "items"), (snapshot) => {
        items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(document.getElementById('itemGrid')) window.renderItems();
        if(document.getElementById('inventoryTableBody')) window.renderInventory();
        if(window.updateDashboardStats) window.updateDashboardStats();
    });

    onSnapshot(collection(db, "requests"), (snapshot) => {
        borrowRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(document.getElementById('itemGrid')) window.renderItems(); 
        if(document.getElementById('requestTableBody')) window.renderRequests();
        if(document.getElementById('inventoryTableBody')) window.renderInventory();
        if(window.updateDashboardStats) window.updateDashboardStats();
    });

    onSnapshot(collection(db, "users"), (snapshot) => {
        users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(document.getElementById('adminUserTableBody')) window.loadUsersToAdminTable();
    });
}

/* ==========================================
   🔥 DASHBOARD & CART FUNCTIONS 🔥
   ========================================== */
window.renderItems = (cat = 'all') => {
    const grid = document.getElementById('itemGrid'); if(!grid) return; grid.innerHTML = '';
    items.forEach(item => {
        if(cat !== 'all' && item.category !== cat) return;
        
        // 🔥 ค้นหาว่าของชิ้นนี้มีการทำรายการค้างอยู่ไหม (รออนุมัติ, รอรับของ, กำลังยืม)
        const activeReq = borrowRequests.find(r => (r.item && r.item.includes(item.name)) && ['pending', 'approved_pickup', 'borrowed'].includes(r.status));
        let cartItem = cart.find(c => c.id === item.id);
        
        let statusCSS = 'available';
        let btnClass = 'btn-borrow';
        let btnText = '<i class="fas fa-cart-plus"></i> ลงตะกร้า';
        let btnAction = `addToCart('${item.id}', '${item.name}')`;
        let badgeText = 'ว่าง';

        if (activeReq) {
            // ถ้ามีคิวอยู่แล้ว
            statusCSS = 'borrowed'; // ใช้คลาสสีแดง/เทา
            btnClass = 'btn-disabled';
            btnAction = ''; // กดไม่ได้
            
            if (activeReq.status === 'pending') {
                btnText = '<i class="fas fa-user-clock"></i> ติดจองแล้ว';
                badgeText = 'รออนุมัติ';
            } else {
                btnText = '<i class="fas fa-ban"></i> ไม่ว่าง';
                badgeText = 'ถูกยืม';
            }
        } else if (cartItem) {
            // ถ้าอยู่ในตะกร้าเราเอง
            statusCSS = 'incart';
            btnText = `กำลังจอง (${cartItem.qty})`;
            badgeText = 'ในตะกร้า';
        }
        
        grid.innerHTML += `<div class="card"><div class="card-img"><img src="${item.image}"><div class="status-badge ${statusCSS}">${badgeText}</div></div><div class="card-body"><h4>${item.name}</h4><span class="category-tag">${item.category.toUpperCase()}</span><button class="${btnClass}" onclick="${btnAction}">${btnText}</button></div></div>`;
    });
}

window.addToCart = async function(id, name) {
    const { value: qty } = await Swal.fire({
        title: 'ระบุจำนวนที่ต้องการยืม',
        html: `อุปกรณ์: <b style="color:#ff9800">${name}</b>`,
        input: 'number',
        inputValue: 1,
        inputAttributes: { min: 1, step: 1 },
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check"></i> ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#28a745',
        background: '#1a1a1a',
        color: '#fff'
    });

    if (qty && qty > 0) {
        cart.push({ id, name, qty: parseInt(qty) });
        window.updateCartCount();
        window.renderItems(); 
        Swal.fire({icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว', text: `จำนวน ${qty} ชิ้น`, showConfirmButton: false, timer: 1500, position: 'top-end', toast: true});
    }
}

window.updateCartCount = function() {
    const badge = document.getElementById('cartCountBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0); 
    if(badge) badge.innerText = totalItems;
}

window.openCartModal = function() {
    if(cart.length === 0) { Swal.fire('ตะกร้าว่างเปล่า', 'กรุณาเลือกอุปกรณ์ก่อนทำการจอง', 'info'); return; }
    document.getElementById('cartBorrowerName').value = currentUser.name || currentUser.username;
    
    const dateInput = document.getElementById('cartBorrowDate');
    if (dateInput) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${y}-${m}-${d}`;
        dateInput.value = "";
    }

    document.getElementById('cartItemsList').innerHTML = cart.map((item, index) =>
        `<div style="display:flex; justify-content:space-between; align-items:center; color:white; padding:8px 0; border-bottom:1px solid #444;">
            <span>${index+1}. ${item.name} <strong style="color:#ff9800; margin-left:10px;">(x${item.qty})</strong></span>
            <button type="button" onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:#dc3545; cursor:pointer;"><i class="fas fa-trash"></i></button>
        </div>`
    ).join('');

    document.getElementById('cartModal').style.display = 'flex';
}

window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id); window.updateCartCount(); window.renderItems();
    if(cart.length === 0) window.closeCartModal(); else window.openCartModal();
}
window.closeCartModal = () => document.getElementById('cartModal').style.display = 'none';

window.openHistoryModal = () => {
    const tbody = document.getElementById('historyTableBody'); if(!tbody) return; tbody.innerHTML = '';
    const myReqs = borrowRequests.filter(r => r.user === (currentUser.name||currentUser.username)).sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0));
    if (myReqs.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">ไม่มีประวัติ</td></tr>';
    else myReqs.forEach(r => {
        let statusBadge = '', actionBtn = '-';
        if(r.status === 'pending') statusBadge = '<span style="color:#ffc107">⏳ รออนุมัติ</span>';
        else if (r.status === 'approved_pickup') { statusBadge = '<span style="color:#0dcaf0">📦 รอรับของ</span>'; actionBtn = `<button onclick="triggerPickup('${r.id}')" class="btn-confirm" style="padding:5px; font-size:12px;">📷 ยืนยันรับของ</button>`; }
        else if (r.status === 'borrowed') { statusBadge = '<span style="color:#198754">✅ กำลังยืม</span>'; actionBtn = `<button onclick="viewPhoto('${r.id}')" style="background:none; border:none; color:#ff9800; cursor:pointer; text-decoration:underline;">ดูรูป</button>`; }
        else if (r.status === 'returned') statusBadge = '<span style="color:#aaa">↩️ คืนแล้ว</span>';
        else statusBadge = '<span style="color:red">❌ ปฏิเสธ</span>';
        tbody.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333">${r.item}</td><td style="padding:10px; border-bottom:1px solid #333">${r.date}</td><td style="padding:10px; border-bottom:1px solid #333">${statusBadge}</td><td style="padding:10px; border-bottom:1px solid #333">${actionBtn}</td></tr>`;
    });
    document.getElementById('historyModal').style.display = 'flex';
}
window.closeHistoryModal = () => document.getElementById('historyModal').style.display = 'none';
window.filterItems = (cat) => { document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); window.renderItems(cat); }
window.searchItem = (t) => { Array.from(document.getElementsByClassName('card')).forEach(c => c.style.display = c.querySelector('h4').innerText.toLowerCase().includes(t.toLowerCase()) ? 'flex' : 'none'); }
window.triggerPickup = (reqId) => { currentPickupId = reqId; const f = document.getElementById('pickupProofInput'); if(f) f.click(); }

/* ==========================================
   🔥 ADMIN SYSTEM FUNCTIONS 🔥
   ========================================== */
window.switchTab = (t) => { 
    document.querySelectorAll('.content-section').forEach(e => e.style.display = 'none'); 
    document.querySelectorAll('.sidebar-menu a').forEach(e => e.classList.remove('active')); 
    document.getElementById(`section-${t}`).style.display = 'block'; 
    document.getElementById(`menu-${t}`).classList.add('active'); 
}

window.renderRequests = () => {
    const tbody = document.getElementById('requestTableBody'); if(!tbody) return; tbody.innerHTML = '';
    const sortedReqs = [...borrowRequests].sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0));
    sortedReqs.forEach(r => {
        let badge, btns, photoDisplay = r.proofPhoto ? `<button onclick="viewPhoto('${r.id}')" style="background:none; border:none; color:#ff6600; cursor:pointer; font-weight:bold; text-decoration:underline;">📷 รูปรับของ</button>` : '-';
        if(r.status === 'pending') { badge = '<span class="badge status-pending">ใหม่</span>'; btns = `<button class="btn-action" style="background:#28a745;" onclick="updateStatus('${r.id}','approved_pickup')">อนุญาต</button> <button class="btn-action btn-reject" onclick="updateStatus('${r.id}','rejected')">ปฏิเสธ</button>`; }
        else if (r.status === 'approved_pickup') { badge = '<span class="badge" style="background:#0dcaf0; color:black;">รอรับของ</span>'; btns = '<span style="font-size:12px; color:#aaa;">รอถ่ายรูป</span>'; }
        else if(r.status === 'borrowed') { badge = '<span class="badge status-approved">ถูกยืม</span>'; btns = `<button class="btn-action" style="background:#0099cc;" onclick="updateStatus('${r.id}','returned')">รับคืน</button>`; }
        else { badge = `<span class="badge" style="background:#333; color:#aaa">${r.status}</span>`; btns = `<button class="btn-action btn-reject" onclick="deleteRequest('${r.id}')"><i class="fas fa-trash"></i></button>`; }
        tbody.innerHTML += `<tr><td>${r.user}</td><td>${r.item}</td><td>${r.date}</td><td>${badge}</td><td>${photoDisplay}</td><td>${btns}</td></tr>`;
    });
}

window.updateStatus = async (id, s) => { await updateDoc(doc(db, "requests", id), { status: s }); }
window.deleteRequest = async (id) => { if((await Swal.fire({title:'ลบ?',icon:'warning',showCancelButton:true})).isConfirmed) { await deleteDoc(doc(db, "requests", id)); Swal.fire('ลบแล้ว','','success'); } }

window.renderInventory = () => { 
    const tbody = document.getElementById('inventoryTableBody'); if(!tbody) return; tbody.innerHTML = ''; 
    items.forEach(i => { 
        // 🔥 อัปเดตในตารางแอดมินให้ขึ้นว่า "ติดจอง" ถ้ามีคิว
        const activeReq = borrowRequests.find(r => r.item && r.item.includes(i.name) && ['pending', 'approved_pickup', 'borrowed'].includes(r.status));
        
        let st = '<span style="color:var(--success)">ว่าง</span>';
        if (activeReq) {
            if(activeReq.status === 'pending') st = '<span style="color:#ffc107">ติดจอง (รออนุมัติ)</span>';
            else st = '<span style="color:var(--danger)">ไม่ว่าง</span>';
        }
        
        tbody.innerHTML += `<tr><td><img src="${i.image}" width="40"></td><td style="color:white">${i.name}</td><td>${i.category}</td><td>${st}</td><td><button onclick="deleteItem('${i.id}')" class="btn-action btn-reject"><i class="fas fa-trash"></i></button></td></tr>`; 
    }); 
}
window.addNewItem = async () => { const { value: n } = await Swal.fire({ title: 'เพิ่มอุปกรณ์ใหม่', input: 'text', showCancelButton: true }); if(n) { await addDoc(collection(db, "items"), { name: n, category: "general", status: "available", image: "https://placehold.co/100" }); } }
window.deleteItem = async (id) => { if((await Swal.fire({title:'ลบอุปกรณ์?',icon:'warning',showCancelButton:true})).isConfirmed) { await deleteDoc(doc(db, "items", id)); } }

window.updateDashboardStats = () => { 
    const p = document.getElementById('stat-pending'), b = document.getElementById('stat-borrowed'), t = document.getElementById('stat-total-items');
    if(p) p.innerText = borrowRequests.filter(r => r.status === 'pending').length; 
    if(b) b.innerText = borrowRequests.filter(r => r.status === 'borrowed').length; 
    if(t) t.innerText = items.length; 
}

window.loadUsersToAdminTable = function() {
    const tableBody = document.getElementById("adminUserTableBody"); if(!tableBody) return; tableBody.innerHTML = ""; 
    users.forEach((u) => {
        const roleBadge = u.role === 'admin' ? `<span style="background:#ff9800; color:#fff; padding:3px 10px; border-radius:15px; font-size:12px;">Admin</span>` : `<span style="background:#444; color:#fff; padding:3px 10px; border-radius:15px; font-size:12px;">User</span>`;
        let actionBtn = (currentUser && currentUser.id === u.id) ? `<span style="color:#888;">(คุณเอง)</span>` : `<button onclick="changeUserRole('${u.id}', '${u.role}', '${u.name}')" class="btn-action" style="background:#28a745;">สลับสิทธิ์</button>`;
        tableBody.innerHTML += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding:12px;">${u.name||"ไม่มีชื่อ"}</td><td style="padding:12px;">${u.username}</td><td style="padding:12px;">${roleBadge}</td><td style="padding:12px;">${actionBtn}</td></tr>`;
    });
}
window.changeUserRole = async function(userId, currentRole, userName) {
    if((await Swal.fire({title:'เปลี่ยนสิทธิ์?',html:`ยืนยันการเปลี่ยนสิทธิ์ <b>${userName}</b>`, icon:'warning',showCancelButton:true, background:'#1a1a1a', color:'#fff'})).isConfirmed) {
        await updateDoc(doc(db, "users", userId), { role: currentRole === 'admin' ? 'user' : 'admin' });
        Swal.fire({title:'สำเร็จ!',icon:'success',timer:1500,showConfirmButton:false});
    }
}

window.exportToCSV = async function() {
    try {
        Swal.fire({ title: 'กำลังเตรียมรายงาน...', timer: 1000, timerProgressBar: true, didOpen: () => { Swal.showLoading(); }});
        const querySnapshot = await getDocs(collection(db, "requests"));
        let csvContent = "\uFEFFวันที่ส่งคำขอ,ชื่อผู้ยืม,อุปกรณ์ที่ยืม,วันที่ต้องการยืม,สถานะ\n";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let timeString = data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate().toLocaleString('th-TH') : new Date(data.timestamp).toLocaleString('th-TH')) : "-";
            const userName = data.user || "-", itemName = data.item || "-", borrowDate = data.date || "-", status = data.status || "-";
            let statusThai = status === 'pending' ? "รออนุมัติ" : (status === 'approved_pickup' ? "รอรับของ" : (status === 'borrowed' ? "กำลังยืม" : (status === 'returned' ? "คืนแล้ว" : "ถูกปฏิเสธ")));
            csvContent += `"${timeString}","${userName}","${itemName.replace(/"/g, '""')}","${borrowDate}","${statusThai}"\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `MMD_Borrow_Report.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setTimeout(() => Swal.fire({ icon: 'success', title: 'สำเร็จ!', showConfirmButton: false, timer: 1500 }), 1000);
    } catch (error) { Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'โหลดรายงานไม่ได้' }); }
}

/* ==========================================
   🔥 APP INITIALIZATION (เริ่มทำงาน) 🔥
   ========================================== */
function initApp() {
    if(document.getElementById('loginForm')) {
        window.toggleForm = () => { document.getElementById('loginForm').classList.toggle('hidden'); document.getElementById('registerForm').classList.toggle('hidden'); }
        document.getElementById('loginForm').onsubmit = (e) => { e.preventDefault(); window.login(document.getElementById('username').value, document.getElementById('password').value); };
        document.getElementById('registerForm').onsubmit = (e) => { e.preventDefault(); window.register(document.getElementById('regUser').value, document.getElementById('regPass').value, document.getElementById('regName').value); };
        if(currentUser) window.location.href = 'dashboard.html'; 
    }
    
    else if(document.getElementById('itemGrid')) {
        if(window.checkAuth()) { 
            window.listenToData();
            window.updateCartCount();

            if(document.getElementById('cartForm')) {
                document.getElementById('cartForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const date = document.getElementById('cartBorrowDate').value;
                    const reason = document.getElementById('cartReason').value;
                    const submitBtn = document.querySelector('#cartForm button[type="submit"]');

                    const selectedDate = new Date(date); selectedDate.setHours(0,0,0,0);
                    const today = new Date(); today.setHours(0,0,0,0);
                    const maxAllowed = new Date(today); maxAllowed.setDate(today.getDate() + 5);

                    if(selectedDate < today) return Swal.fire({ icon: 'error', title: 'วันที่ไม่ถูกต้อง', text: 'เลือกวันย้อนหลังไม่ได้ครับ' });
                    if(selectedDate > maxAllowed) return Swal.fire({ icon: 'error', title: 'วันที่ไม่ถูกต้อง', text: 'จองล่วงหน้าได้ไม่เกิน 5 วันครับ' });

                    try {
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...'; submitBtn.disabled = true;
                        
                        const itemNamesStr = cart.map(i => `${i.name} (${i.qty} ชิ้น)`).join(', ');

                        await addDoc(collection(db, "requests"), { 
                            user: currentUser.name || currentUser.username, userId: currentUser.id, 
                            item: itemNamesStr, date: date, reason: reason || "-", status: "pending", timestamp: new Date() 
                        });
                        
                        fetch(LINE_API_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ user: currentUser.name, item: itemNamesStr, date: date }) }).catch(e=>console.log(e));
                        if(typeof emailjs !== 'undefined') emailjs.send("service_8q17oo9", "template_4ch9467", { user_name: currentUser.name, item_name: itemNamesStr, borrow_date: date, status: 'pending' });

                        Swal.fire({ icon: 'success', title: 'ส่งคำขอสำเร็จ!', text: 'จองอุปกรณ์เรียบร้อย รอแอดมินอนุมัติครับ', timer: 2500, showConfirmButton: false });
                        cart = []; window.updateCartCount(); window.renderItems(); window.closeCartModal();
                    } catch(e) { Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: e.message }); } 
                    finally { submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> ยืนยันการจองทั้งหมด'; submitBtn.disabled = false; }
                };
            }

            const pickupInput = document.getElementById('pickupProofInput');
            if(pickupInput) {
                pickupInput.onchange = async (e) => {
                    const file = e.target.files[0]; if(!file || !currentPickupId) return;
                    Swal.fire({ title: 'กำลังอัปโหลด...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
                    try {
                        const base64 = await resizeImage(file);
                        await updateDoc(doc(db, "requests", currentPickupId), { status: "borrowed", proofPhoto: base64, pickupTime: new Date() });
                        Swal.fire({ icon: 'success', title: 'รับของสำเร็จ!', timer: 2000, showConfirmButton: false });
                        e.target.value = ''; window.openHistoryModal(); 
                    } catch(err) { Swal.fire({ icon: 'error', title: 'อัปโหลดไม่สำเร็จ', text: err.message }); }
                };
            }
        }
    }

    else if(document.getElementById('section-requests')) {
        const user = window.checkAuth();
        if(user) {
            if(user.role !== 'admin') {
                Swal.fire('ปฏิเสธการเข้าถึง', 'เฉพาะผู้ดูแลระบบเท่านั้น!', 'error').then(() => window.location.href = 'dashboard.html');
            } else {
                window.listenToData();
                document.getElementById('section-requests').style.display = 'block';
            }
        }
    }
}

initApp();