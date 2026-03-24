/* =========================================
   script.js - MMD BORROW SYSTEM (FULL COMPLETE MEGA VERSION + RETURN DATE FEATURE)
   ========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

try { emailjs.init("Rj2WpB-v7fZqvEu08"); } catch (e) { console.warn("⚠️ EmailJS ไม่ถูกโหลด"); }
const LINE_API_URL = "https://script.google.com/macros/s/AKfycbzw0gLpeZEdB8rUofNdPTLKHBQYhfcYcD1S72t_PRI-tSfdfi2-ZqGUw-Hwa4wRP17crg/exec";

// 🔴 Config Firebase ของคุณกาย
const firebaseConfig = {
  apiKey: "AIzaSyCJNX3-vN5bceDczdKxrqb0N8uaBpgDhTE",
  authDomain: "mmd-borrow-app.firebaseapp.com",
  projectId: "mmd-borrow-app",
  storageBucket: "mmd-borrow-app.firebasestorage.app",
  messagingSenderId: "525869633986",
  appId: "1:525869633986:web:ed7a1cbdaa038a098e065b",
  measurementId: "G-G4PV2T14DK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* --- Global Variables --- */
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let items = [], borrowRequests = [], users = [], cart = [];
let currentPickupId = null, currentReturnId = null;
let currentPage = 1; const itemsPerPage = 8; let searchQuery = "";
let borrowChartInstance = null, conditionChartInstance = null;

if (!document.getElementById('returnProofInput')) {
    const returnInput = document.createElement('input'); returnInput.type = 'file'; returnInput.id = 'returnProofInput';
    returnInput.accept = 'image/*'; returnInput.style.display = 'none'; document.body.appendChild(returnInput);
}

/* --- Helpers --- */
function resizeImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image(); img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas'); const maxWidth = 800; 
                let width = img.width, height = img.height;
                if (width > maxWidth) { height = height * (maxWidth / width); width = maxWidth; }
                canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
    });
}

const lightbox = document.createElement('div');
lightbox.id = 'lightbox-modal'; lightbox.style.cssText = 'display:none; position:fixed; z-index:99999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); justify-content:center; align-items:center; cursor:pointer; flex-direction:column;';
lightbox.innerHTML = `<img id="lightbox-img" style="max-width:90%; max-height:85%; border:2px solid white; box-shadow:0 0 20px black; object-fit:contain;"><p style="color:white; margin-top:10px;">แตะที่ว่างเพื่อปิด</p>`;
lightbox.onclick = () => lightbox.style.display = 'none'; document.body.appendChild(lightbox);

window.viewPhoto = function(reqId, type = 'pickup') {
    const req = borrowRequests.find(r => r.id === reqId);
    let photoData = (type === 'return') ? req.returnProofPhoto : req.proofPhoto;
    if (req && photoData) { document.getElementById('lightbox-img').src = photoData; document.getElementById('lightbox-modal').style.display = 'flex'; }
    else { Swal.fire({ icon: 'info', title: 'ไม่พบรูปภาพ', text: 'รายการนี้ยังไม่มีรูปภาพในระบบ' }); }
}

/* ==========================================
   🔥 AUTHENTICATION & DATA 🔥
   ========================================== */
window.checkAuth = function() {
    if (!currentUser) { if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) { window.location.href = 'index.html'; } return null; }
    const display = document.getElementById('userNameDisplay'); if(display) display.innerText = currentUser.name || currentUser.username;
    const btnAdminManage = document.getElementById('btnAdminManage'); if (btnAdminManage) { btnAdminManage.style.display = currentUser.role === 'admin' ? 'inline-flex' : 'none'; }
    return currentUser;
}
window.login = async function(u, p) {
    Swal.fire({ title: 'เข้าสู่ระบบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    try {
        const qs = await getDocs(query(collection(db, "users"), where("username", "==", u), where("password", "==", p)));
        if (!qs.empty) { const d = qs.docs[0].data(); d.id = qs.docs[0].id; localStorage.setItem('currentUser', JSON.stringify(d)); await Swal.fire({ icon: 'success', title: 'สำเร็จ!', timer: 1500, showConfirmButton: false }); window.location.href = 'dashboard.html'; }
        else { Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบล้มเหลว', text: 'รหัสผ่านไม่ถูกต้อง' }); }
    } catch (error) { Swal.fire('เกิดข้อผิดพลาด', error.message, 'error'); }
}
window.register = async function(u, p, n) {
    try {
        if (!(await getDocs(query(collection(db, "users"), where("username", "==", u)))).empty) { Swal.fire('ข้อมูลซ้ำ', 'มีผู้ใช้นี้แล้ว', 'warning'); return; }
        await addDoc(collection(db, "users"), { username: u, password: p, role: "user", name: n });
        Swal.fire({ icon: 'success', title: 'สมัครสำเร็จ!', timer: 2000, showConfirmButton: false }); if(window.toggleForm) window.toggleForm();
    } catch (e) { Swal.fire('เกิดข้อผิดพลาด', e.message, 'error'); }
}
window.logout = () => Swal.fire({ title: 'ออกจากระบบ?', icon: 'question', showCancelButton: true }).then((res) => { if(res.isConfirmed){ localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }});

window.listenToData = function() {
    onSnapshot(collection(db, "items"), (snap) => { items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); if(document.getElementById('itemGrid')) window.renderItems(); if(document.getElementById('inventoryTableBody')) window.renderInventory(); if(window.updateDashboardStats) window.updateDashboardStats(); if(document.getElementById('section-stats') && document.getElementById('section-stats').style.display === 'block') window.renderStats(); });
    onSnapshot(collection(db, "requests"), (snap) => { borrowRequests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); if(document.getElementById('itemGrid')) window.renderItems(); if(document.getElementById('requestTableBody')) window.renderRequests(); if(document.getElementById('inventoryTableBody')) window.renderInventory(); if(window.updateDashboardStats) window.updateDashboardStats(); if(document.getElementById('section-stats') && document.getElementById('section-stats').style.display === 'block') window.renderStats(); });
    onSnapshot(collection(db, "users"), (snap) => { users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); if(document.getElementById('adminUserTableBody')) window.loadUsersToAdminTable(); });
}

/* ==========================================
   🔥 USER DASHBOARD & ITEM DETAILS 🔥
   ========================================== */
window.renderItems = (cat = 'all') => {
    const grid = document.getElementById('itemGrid'); if(!grid) return; grid.innerHTML = '';
    items.forEach(item => {
        if(cat !== 'all' && item.category !== cat) return;
        const activeReq = borrowRequests.find(r => (r.item && r.item.includes(item.name)) && ['pending', 'approved_pickup', 'borrowed', 'pending_return'].includes(r.status));
        let cartItem = cart.find(c => c.id === item.id);
        
        let statusCSS = 'available', btnClass = 'btn-borrow', btnText = '<i class="fas fa-cart-plus"></i> จอง', btnAction = `addToCart('${item.id}', '${item.name}')`, badgeText = 'ว่าง';

        if (item.condition === 'damaged') { statusCSS = 'borrowed'; btnClass = 'btn-disabled'; btnAction = ''; btnText = '<i class="fas fa-wrench"></i> ชำรุด'; badgeText = 'ซ่อม'; }
        else if (activeReq) {
            statusCSS = 'borrowed'; btnClass = 'btn-disabled'; btnAction = ''; 
            if (activeReq.status === 'pending') { btnText = '<i class="fas fa-user-clock"></i> ติดจอง'; badgeText = 'รออนุมัติ'; } 
            else if (activeReq.status === 'pending_return') { btnText = '<i class="fas fa-spinner"></i> รอตรวจ'; badgeText = 'รอตรวจ'; }
            else { btnText = '<i class="fas fa-ban"></i> ไม่ว่าง'; badgeText = 'ถูกยืม'; }
        } 
        else if (cartItem) { statusCSS = 'incart'; btnText = `เลือกแล้ว (${cartItem.qty})`; badgeText = 'ตะกร้า'; }
        
        grid.innerHTML += `<div class="card"><div class="card-img" onclick="window.openItemDetail('${item.id}')" style="cursor:pointer;"><img src="${item.image}"><div class="status-badge ${statusCSS}">${badgeText}</div></div><div class="card-body"><h4>${item.name}</h4><span class="category-tag">${item.category.toUpperCase()}</span><div style="display:flex; gap:5px; margin-top:auto;"><button onclick="window.openItemDetail('${item.id}')" style="flex:1; padding:10px; border-radius:6px; background:#444; color:white; border:none; cursor:pointer;"><i class="fas fa-info-circle"></i></button><button class="${btnClass}" onclick="${btnAction}" style="flex:3; margin-top:0;">${btnText}</button></div></div></div>`;
    });
}

window.openItemDetail = function(id) {
    const item = items.find(i => i.id === id); if (!item) return;
    const diff = item.difficulty || "ระดับปานกลาง (Medium)";
    const desc = item.description || "ยังไม่มีข้อมูลเพิ่มเติม...";
    const ref = item.reference || "อ้างอิงข้อมูลพื้นฐาน";
    
    const activeReq = borrowRequests.find(r => (r.item && r.item.includes(item.name)) && ['pending', 'approved_pickup', 'borrowed', 'pending_return'].includes(r.status));
    let btn = (item.condition === 'damaged' || activeReq) ? `<button class="btn-disabled" style="width:100%; padding:12px; border-radius:8px;"><i class="fas fa-ban"></i> ไม่พร้อม</button>` : `<button class="btn-borrow" onclick="addToCart('${item.id}', '${item.name}'); window.closeItemDetail();" style="width:100%; padding:12px; border-radius:8px; background:var(--theme-primary);"><i class="fas fa-cart-plus"></i> เพิ่มลงตะกร้า</button>`;

    document.getElementById('itemDetailBody').innerHTML = `
        <div style="display:flex; flex-direction:column; background:#1a1a1a;">
            <div style="height: 250px; background: #000; display:flex; justify-content:center; align-items:center;"><img src="${item.image}" style="max-width:100%; max-height:100%; object-fit:contain;"></div>
            <div style="padding: 20px;">
                <span class="category-tag" style="background:#333;">${item.category.toUpperCase()}</span>
                <h2 style="margin: 5px 0 15px; color:var(--theme-primary);">${item.name}</h2>
                <div style="background: #111; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333; font-size: 14px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 10px; border-bottom: 1px dashed #444; padding-bottom: 10px;"><span style="color:#aaa;">สภาพ:</span><strong style="color:${item.condition === 'damaged' ? 'var(--danger)' : 'var(--success)'}">${item.condition === 'damaged' ? 'ชำรุด / ส่งซ่อม' : 'ใช้งานได้ปกติ'}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span style="color:#aaa;">ระดับใช้งาน:</span><strong style="color:var(--warning);">${diff}</strong></div>
                </div>
                <div style="margin-bottom: 15px;"><h4 style="color:#fff; margin-bottom:8px;">รายละเอียด:</h4><p style="color:#bbb; font-size:13px; margin:0; background:#000; padding:15px; border-radius:8px; white-space: pre-wrap;">${desc}</p></div>
                <div style="margin-bottom: 20px; font-size: 11px; color: #888; text-align: right;">อ้างอิง: <em>${ref}</em></div>
                ${btn}
            </div>
        </div>`;
    document.getElementById('itemDetailModal').style.display = 'flex';
}
window.closeItemDetail = () => document.getElementById('itemDetailModal').style.display = 'none';

window.addToCart = async function(id, name) {
    const { value: qty } = await Swal.fire({ title: 'จำนวนยืม', html: `<b>${name}</b>`, input: 'number', inputValue: 1, inputAttributes: { min: 1 }, showCancelButton: true, confirmButtonColor: '#28a745', background: '#1a1a1a', color: '#fff' });
    if (qty > 0) { cart.push({ id, name, qty: parseInt(qty) }); window.updateCartCount(); window.renderItems(); Swal.fire({icon: 'success', title: 'เพิ่มแล้ว', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false}); }
}
window.updateCartCount = () => { const b = document.getElementById('cartCountBadge'); if(b) b.innerText = cart.reduce((s, i) => s + i.qty, 0); }

// 🟢 อัปเดต: หน้าต่างตะกร้า (เพิ่มระบบกำหนดวันคืน)
window.openCartModal = () => {
    if(cart.length === 0) return Swal.fire('ตะกร้าว่าง', '', 'info');
    document.getElementById('cartBorrowerName').value = currentUser.name || currentUser.username;
    
    const dInput = document.getElementById('cartBorrowDate'); 
    const rInput = document.getElementById('cartReturnDate');
    
    if(dInput && rInput) { 
        const today = new Date().toISOString().split('T')[0]; 
        dInput.min = today; dInput.value = ""; 
        rInput.min = today; rInput.value = ""; 
        
        // เมื่อเลือกวันรับ จะบังคับให้วันคืน ห้ามเลือกก่อนวันรับ
        dInput.onchange = () => {
            rInput.min = dInput.value;
            if (rInput.value && rInput.value < dInput.value) rInput.value = dInput.value;
        };
    }
    
    document.getElementById('cartItemsList').innerHTML = cart.map((i, idx) => `<div style="display:flex; justify-content:space-between; color:white; padding:8px 0; border-bottom:1px solid #444;"><span>${idx+1}. ${i.name} (x${i.qty})</span><button type="button" onclick="removeFromCart('${i.id}')" style="background:none; border:none; color:#dc3545; cursor:pointer;"><i class="fas fa-trash"></i></button></div>`).join('');
    document.getElementById('cartModal').style.display = 'flex';
}

window.removeFromCart = (id) => { cart = cart.filter(i => i.id !== id); window.updateCartCount(); window.renderItems(); cart.length === 0 ? window.closeCartModal() : window.openCartModal(); }
window.closeCartModal = () => document.getElementById('cartModal').style.display = 'none';

// 🟢 อัปเดต: หน้าประวัติการจอง (แสดงวันรับ-วันคืน)
window.openHistoryModal = () => {
    const tbody = document.getElementById('historyTableBody'); if(!tbody) return; tbody.innerHTML = '';
    const myReqs = borrowRequests.filter(r => r.user === (currentUser.name||currentUser.username)).sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0));
    if (myReqs.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">ไม่มีประวัติ</td></tr>'; }
    else myReqs.forEach(r => {
        let st='', btn='-';
        if(r.status === 'pending') st='<span style="color:#ffc107">⏳ รออนุมัติ</span>';
        else if(r.status === 'approved_pickup') { st='<span style="color:#0dcaf0">📦 ดำเนินการ</span>'; btn=`<button onclick="triggerPickup('${r.id}')" class="btn-confirm" style="padding:5px; font-size:12px;">📷 รับของ</button>`; }
        else if(r.status === 'borrowed') { st='<span style="color:#198754">✅ กำลังยืม</span>'; btn=`<button onclick="viewPhoto('${r.id}', 'pickup')" style="background:none; border:none; color:#0dcaf0; font-size:12px; cursor:pointer;">ดูรูปรับ</button> <button onclick="triggerReturn('${r.id}')" class="btn-confirm" style="padding:5px; font-size:12px; background:#ff9800; margin:0;">📷 ส่งคืน</button>`; }
        else if(r.status === 'pending_return') { st='<span style="color:#ff9800">🔄 รอตรวจ</span>'; btn=`<button onclick="viewPhoto('${r.id}', 'return')" style="background:none; border:none; color:#ff9800; font-size:12px; cursor:pointer;">ดูรูปคืน</button>`; }
        else if(r.status === 'returned') { st='<span style="color:#aaa">↩️ คืนแล้ว</span>'; btn=`<button onclick="viewPhoto('${r.id}', 'pickup')" style="background:none; border:none; color:#0dcaf0; font-size:12px; cursor:pointer;">รูปรับ</button> <button onclick="viewPhoto('${r.id}', 'return')" style="background:none; border:none; color:#ff9800; font-size:12px; cursor:pointer;">รูปคืน</button>`; }
        else st='<span style="color:red">❌ ปฏิเสธ</span>';
        
        let dateHtml = `รับ: ${r.date}<br><span style="color:var(--warning); font-size:12px;">คืน: ${r.returnDate || '-'}</span>`;
        tbody.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333">${r.item}</td><td style="padding:10px; border-bottom:1px solid #333">${dateHtml}</td><td style="padding:10px; border-bottom:1px solid #333">${st}</td><td style="padding:10px; border-bottom:1px solid #333">${btn}</td></tr>`;
    });
    document.getElementById('historyModal').style.display = 'flex';
}
window.closeHistoryModal = () => document.getElementById('historyModal').style.display = 'none';
window.filterItems = (cat) => { document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); window.renderItems(cat); }
window.searchItem = (t) => { Array.from(document.getElementsByClassName('card')).forEach(c => c.style.display = c.querySelector('h4').innerText.toLowerCase().includes(t.toLowerCase()) ? 'flex' : 'none'); }
window.triggerPickup = (id) => { currentPickupId = id; document.getElementById('pickupProofInput').click(); }
window.triggerReturn = (id) => { currentReturnId = id; document.getElementById('returnProofInput').click(); }

/* ==========================================
   🔥 ADMIN SYSTEM 🔥
   ========================================== */
window.switchTab = (t) => { 
    document.querySelectorAll('.content-section').forEach(e => e.style.display = 'none'); 
    document.querySelectorAll('.sidebar-menu a').forEach(e => e.classList.remove('active')); 
    document.getElementById(`section-${t}`).style.display = 'block'; 
    document.getElementById(`menu-${t}`).classList.add('active'); 
    if (t === 'stats') { window.renderStats(); }
}

window.searchRequest = (query) => { searchQuery = query.toLowerCase(); currentPage = 1; window.renderRequests(); }

// 🟢 อัปเดต: หน้าแอดมิน แสดงวันรับ-วันคืน
window.renderRequests = () => {
    const tbody = document.getElementById('requestTableBody'); if(!tbody) return; tbody.innerHTML = '';
    let reqs = [...borrowRequests].sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0));
    if(searchQuery) reqs = reqs.filter(r => (r.user && r.user.toLowerCase().includes(searchQuery)) || (r.item && r.item.toLowerCase().includes(searchQuery)));
    
    const pages = Math.ceil(reqs.length / itemsPerPage) || 1; if(currentPage > pages) currentPage = pages; 
    const pagedReqs = reqs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (pagedReqs.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">ไม่พบข้อมูล</td></tr>`; return; }
    
    pagedReqs.forEach(r => {
        let photoDisplay = `<div style="display:flex; gap:5px;">${r.proofPhoto ? `<button onclick="viewPhoto('${r.id}', 'pickup')" style="background:none; border:none; color:#0dcaf0; cursor:pointer;">📷 รับ</button>` : ''}${r.returnProofPhoto ? `<button onclick="viewPhoto('${r.id}', 'return')" style="background:none; border:none; color:#ff9800; cursor:pointer;">📷 คืน</button>` : ''}</div>`;
        if(!r.proofPhoto && !r.returnProofPhoto) photoDisplay = '-';
        
        let badge = '', btns = '';
        
        if(r.status === 'pending') { 
            badge = '<span class="badge" style="background:transparent; color:#ffc107; border:1px solid #ffc107;">ใหม่</span>'; 
            btns = `<button onclick="updateStatus('${r.id}','approved_pickup')" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; margin-right:5px;">อนุญาต</button> 
                    <button onclick="updateStatus('${r.id}','rejected')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">ปฏิเสธ</button>`; 
        } 
        else if (r.status === 'approved_pickup') { 
            badge = '<span class="badge" style="background:#0dcaf0; color:black;">ดำเนินการ</span>'; 
            btns = `<button onclick="updateStatus('${r.id}','pending')" style="background:#ffc107; color:#000; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;"><i class="fas fa-undo"></i> ยกเลิก</button>`; 
        } 
        else if(r.status === 'borrowed') { 
            badge = '<span class="badge" style="background:#198754; color:white;">ถูกยืม</span>'; 
            btns = `<button onclick="updateStatus('${r.id}','returned')" style="background:#6c757d; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">รับคืน(ข้ามรูป)</button>`; 
        } 
        else if (r.status === 'pending_return') { 
            badge = '<span class="badge" style="background:#ff9800; color:#fff;">รอตรวจคืน</span>'; 
            btns = `<button onclick="updateStatus('${r.id}','returned')" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; margin-right:5px;">ยืนยัน</button> 
                    <button onclick="updateStatus('${r.id}','borrowed')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">ตีกลับ</button>`; 
        }
        else { 
            let statusText = r.status === 'returned' ? 'คืนแล้ว' : 'ปฏิเสธ';
            let statusColor = r.status === 'returned' ? '#6c757d' : '#dc3545';
            badge = `<span class="badge" style="background:#333; color:${statusColor};">${statusText}</span>`; 
            btns = `<button onclick="deleteRequest('${r.id}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;"><i class="fas fa-trash"></i> ลบ</button>`; 
        }
        
        let dateHtml = `รับ: ${r.date}<br><span style="color:var(--warning); font-size:12px;">คืน: ${r.returnDate || '-'}</span>`;
        tbody.innerHTML += `<tr><td>${r.user}</td><td>${r.item}</td><td>${dateHtml}</td><td>${badge}</td><td>${photoDisplay}</td><td>${btns}</td></tr>`;
    });
    if(window.renderPagination) window.renderPagination(reqs.length, pages);
}

window.renderPagination = (total, pages) => {
    const c = document.getElementById('paginationControls'); if(!c) return; if (total <= itemsPerPage) { c.innerHTML = ''; return; }
    let h = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    for (let i=1; i<=pages; i++) h += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    h += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === pages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`; c.innerHTML = h;
}
window.changePage = (p) => { currentPage = p; window.renderRequests(); }
window.updateStatus = async (id, s) => { await updateDoc(doc(db, "requests", id), { status: s }); }
window.deleteRequest = async (id) => { if((await Swal.fire({title:'ลบ?',icon:'warning',showCancelButton:true})).isConfirmed) { await deleteDoc(doc(db, "requests", id)); Swal.fire('ลบแล้ว','','success'); } }

window.renderInventory = () => { 
    const tbody = document.getElementById('inventoryTableBody'); if(!tbody) return; tbody.innerHTML = ''; 
    items.forEach(i => { 
        const activeReq = borrowRequests.find(r => r.item && r.item.includes(i.name) && ['pending', 'approved_pickup', 'borrowed', 'pending_return'].includes(r.status));
        let st = '<span style="color:var(--success)">ว่าง</span>';
        if (activeReq) st = activeReq.status === 'pending' ? '<span style="color:#ffc107">ติดจอง</span>' : (activeReq.status === 'pending_return' ? '<span style="color:#ff9800">รอตรวจ</span>' : '<span style="color:var(--danger)">ไม่ว่าง</span>');
        
        let condBtn = i.condition === 'damaged' 
            ? `<button onclick="toggleCondition('${i.id}', 'good')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;">ชำรุด (ส่งซ่อม)</button>` 
            : `<button onclick="toggleCondition('${i.id}', 'damaged')" style="background:#198754; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;">ปกติ (ใช้งานได้)</button>`;
            
        let actionBtns = `
            <div style="display:flex; gap:5px;">
                <button onclick="editItem('${i.id}')" style="background:#ffc107; color:#000; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;" title="แก้ไขข้อมูลอุปกรณ์"><i class="fas fa-edit"></i> แก้ไข</button>
                <button onclick="deleteItem('${i.id}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;" title="ลบอุปกรณ์"><i class="fas fa-trash"></i></button>
            </div>
        `;
            
        tbody.innerHTML += `<tr><td><img src="${i.image}" width="40" style="border-radius:4px;"></td><td style="color:white">${i.name}</td><td>${i.category}</td><td>${st}</td><td>${condBtn}</td><td>${actionBtns}</td></tr>`; 
    }); 
}
window.toggleCondition = async (id, n) => { if((await Swal.fire({title:'เปลี่ยนสภาพของ?', icon:'question',showCancelButton:true, background:'#1a1a1a', color:'#fff'})).isConfirmed) { await updateDoc(doc(db, "items", id), { condition: n }); } }
window.deleteItem = async (id) => { if((await Swal.fire({title:'ลบ?',icon:'warning',showCancelButton:true})).isConfirmed) { await deleteDoc(doc(db, "items", id)); } }

window.addNewItem = async () => {
    const { value: formValues } = await Swal.fire({
        title: '📦 เพิ่มอุปกรณ์ใหม่',
        width: 600,
        html: `
            <div style="text-align: left; font-size: 14px; display: flex; flex-direction: column; gap: 12px;">
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">ชื่ออุปกรณ์</label>
                    <input id="swal-name" class="swal2-input" placeholder="เช่น SONY A7M4" style="width: 100%; margin: 0; box-sizing: border-box;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">หมวดหมู่</label>
                        <select id="swal-category" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box;">
                            <option value="camera">กล้อง</option>
                            <option value="tripod">ขาตั้ง/Gimbal</option>
                            <option value="audio">เสียง</option>
                            <option value="light">ไฟสตูดิโอ</option>
                            <option value="general">ทั่วไป</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">ระดับความยาก</label>
                        <select id="swal-difficulty" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box;">
                            <option value="ระดับง่ายมาก (Beginner)">🟢 ง่ายมาก</option>
                            <option value="ระดับปานกลาง (Medium)">🟡 ปานกลาง</option>
                            <option value="ระดับค่อนข้างยาก (Advanced)">🟠 ค่อนข้างยาก</option>
                            <option value="ระดับมืออาชีพ (Pro)">🔴 มืออาชีพ</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">อัปโหลดรูปภาพอุปกรณ์ (คลิกเพื่อเลือกไฟล์)</label>
                    <input type="file" id="swal-image-file" accept="image/*" style="width: 100%; color: #fff; background: #222; padding: 12px; border-radius: 5px; border: 1px solid #444; box-sizing: border-box;">
                </div>
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">อ้างอิงความยากจาก</label>
                    <input id="swal-ref" class="swal2-input" placeholder="เช่น คู่มือผู้ใช้, DPreview" style="width: 100%; margin: 0; box-sizing: border-box;">
                </div>
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">รายละเอียด / คำแนะนำเพิ่มเติม</label>
                    <textarea id="swal-desc" class="swal2-textarea" style="width: 100%; margin: 0; box-sizing: border-box; height: 80px;" placeholder="คำอธิบายสเปค หรือ ข้อควรระวัง..."></textarea>
                </div>
            </div>`,
        showCancelButton: true, confirmButtonText: '<i class="fas fa-save"></i> บันทึกอุปกรณ์', confirmButtonColor: '#28a745', background: '#1a1a1a', color: '#fff',
        preConfirm: async () => {
            const name = document.getElementById('swal-name').value; 
            if(!name) { Swal.showValidationMessage('กรุณากรอกชื่ออุปกรณ์ด้วยครับ'); return false; }
            
            const fileInput = document.getElementById('swal-image-file');
            let base64Image = "https://placehold.co/400x300?text=No+Image"; 
            
            if (fileInput.files.length > 0) {
                try {
                    Swal.showLoading(); 
                    base64Image = await resizeImage(fileInput.files[0]);
                } catch (error) {
                    Swal.showValidationMessage('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ'); return false;
                }
            }
            return { name: name, category: document.getElementById('swal-category').value, image: base64Image, difficulty: document.getElementById('swal-difficulty').value, reference: document.getElementById('swal-ref').value || "อ้างอิงข้อมูลพื้นฐาน", description: document.getElementById('swal-desc').value || "-", status: "available", condition: "good" }
        }
    });

    if (formValues) { 
        Swal.fire({ title: 'กำลังอัปโหลดขึ้นระบบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff'}); 
        try { await addDoc(collection(db, "items"), formValues); Swal.fire({ icon: 'success', title: 'เพิ่มอุปกรณ์สำเร็จ!', timer: 1500, background: '#1a1a1a', color: '#fff', showConfirmButton:false }); } 
        catch(e) { Swal.fire('Error', e.message, 'error'); } 
    }
}

window.editItem = async function(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const diff = item.difficulty || "ระดับปานกลาง (Medium)";
    const ref = item.reference || "";
    const desc = item.description || "";

    const { value: formValues } = await Swal.fire({
        title: '✏️ แก้ไขข้อมูลอุปกรณ์',
        width: 600,
        html: `
            <div style="text-align: left; font-size: 14px; display: flex; flex-direction: column; gap: 12px;">
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">ชื่ออุปกรณ์</label>
                    <input id="swal-edit-name" class="swal2-input" value="${item.name}" style="width: 100%; margin: 0; box-sizing: border-box;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">หมวดหมู่</label>
                        <select id="swal-edit-category" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box;">
                            <option value="camera" ${item.category === 'camera' ? 'selected' : ''}>กล้อง</option>
                            <option value="tripod" ${item.category === 'tripod' ? 'selected' : ''}>ขาตั้ง/Gimbal</option>
                            <option value="audio" ${item.category === 'audio' ? 'selected' : ''}>เสียง</option>
                            <option value="light" ${item.category === 'light' ? 'selected' : ''}>ไฟสตูดิโอ</option>
                            <option value="general" ${item.category === 'general' ? 'selected' : ''}>ทั่วไป</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">ระดับความยาก</label>
                        <select id="swal-edit-difficulty" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box;">
                            <option value="ระดับง่ายมาก (Beginner)" ${diff.includes('ง่าย') ? 'selected' : ''}>🟢 ง่ายมาก</option>
                            <option value="ระดับปานกลาง (Medium)" ${diff.includes('ปานกลาง') ? 'selected' : ''}>🟡 ปานกลาง</option>
                            <option value="ระดับค่อนข้างยาก (Advanced)" ${diff.includes('ค่อนข้างยาก') ? 'selected' : ''}>🟠 ค่อนข้างยาก</option>
                            <option value="ระดับมืออาชีพ (Pro)" ${diff.includes('มืออาชีพ') ? 'selected' : ''}>🔴 มืออาชีพ</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">เปลี่ยนรูปภาพ (ถ้าไม่เปลี่ยน ไม่ต้องเลือกไฟล์)</label>
                    <input type="file" id="swal-edit-image-file" accept="image/*" style="width: 100%; color: #fff; background: #222; padding: 12px; border-radius: 5px; border: 1px solid #444; box-sizing: border-box;">
                </div>
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">อ้างอิงความยากจาก</label>
                    <input id="swal-edit-ref" class="swal2-input" value="${ref}" style="width: 100%; margin: 0; box-sizing: border-box;">
                </div>
                <div>
                    <label style="color:#aaa; display:block; margin-bottom:5px;">รายละเอียด / คำแนะนำเพิ่มเติม</label>
                    <textarea id="swal-edit-desc" class="swal2-textarea" style="width: 100%; margin: 0; box-sizing: border-box; height: 80px;">${desc}</textarea>
                </div>
            </div>`,
        showCancelButton: true, confirmButtonText: '<i class="fas fa-save"></i> บันทึกการแก้ไข', confirmButtonColor: '#ffc107', background: '#1a1a1a', color: '#fff',
        preConfirm: async () => {
            const name = document.getElementById('swal-edit-name').value;
            if (!name) { Swal.showValidationMessage('กรุณากรอกชื่ออุปกรณ์ด้วยครับ'); return false; }
            
            const fileInput = document.getElementById('swal-edit-image-file');
            let base64Image = item.image;
            
            if (fileInput.files.length > 0) {
                try {
                    Swal.showLoading();
                    base64Image = await resizeImage(fileInput.files[0]); 
                } catch (error) {
                    Swal.showValidationMessage('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ'); return false;
                }
            }
            
            return {
                name: name,
                category: document.getElementById('swal-edit-category').value,
                image: base64Image,
                difficulty: document.getElementById('swal-edit-difficulty').value,
                reference: document.getElementById('swal-edit-ref').value,
                description: document.getElementById('swal-edit-desc').value
            };
        }
    });

    if (formValues) {
        Swal.fire({ title: 'กำลังอัปเดตข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff'});
        try {
            await updateDoc(doc(db, "items", id), formValues);
            Swal.fire({ icon: 'success', title: 'แก้ไขข้อมูลสำเร็จ!', timer: 1500, background: '#1a1a1a', color: '#fff', showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message, background: '#1a1a1a', color: '#fff' });
        }
    }
}

window.updateDashboardStats = () => { document.getElementById('stat-pending').innerText = borrowRequests.filter(r => r.status === 'pending').length; document.getElementById('stat-borrowed').innerText = borrowRequests.filter(r => r.status === 'borrowed').length; document.getElementById('stat-total-items').innerText = items.length; }

window.renderStats = () => {
    let freq = {}; 
    borrowRequests.filter(r => r.status !== 'rejected').forEach(req => { 
        let m; let r = /([^,]+)\s*\((\d+)\s*ชิ้น\)/g; let f=false; 
        while((m=r.exec(req.item))!==null){ f=true; freq[m[1].trim()] = (freq[m[1].trim()]||0)+parseInt(m[2]); } 
        if(!f&&req.item) req.item.split(',').forEach(it=>{ freq[it.trim()]=(freq[it.trim()]||0)+1; }); 
    });
    
    let s = Object.keys(freq).map(k => ({n:k, c:freq[k]})).sort((a,b)=>b.c-a.c).slice(0,10);
    
    const ctxB = document.getElementById('borrowChart'); 
    if(ctxB) { 
        if(borrowChartInstance) borrowChartInstance.destroy(); 
        borrowChartInstance = new Chart(ctxB, { 
            type:'bar', 
            data: {labels: s.map(i=>i.n), datasets:[{label:'จำนวนการยืม (ครั้ง)', data:s.map(i=>i.c), backgroundColor:'#ff6600'}]}, 
            options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero: true, ticks:{color:'#aaa', stepSize:1}},x:{ticks:{color:'#aaa'}}}}
        }); 
    }
    
    const ctxP = document.getElementById('conditionChart'); 
    if(ctxP) { 
        if(conditionChartInstance) conditionChartInstance.destroy(); 
        conditionChartInstance = new Chart(ctxP, { 
            type:'doughnut', 
            data: {labels:['ปกติ','ชำรุด/ซ่อม'], datasets:[{data:[items.filter(i=>i.condition!=='damaged').length, items.filter(i=>i.condition==='damaged').length], backgroundColor:['#198754','#dc3545'], borderWidth:0}]}, 
            options:{plugins:{legend:{labels:{color:'#fff'}}}}
        }); 
    }
}

window.searchUser = (q) => window.loadUsersToAdminTable(q);
window.loadUsersToAdminTable = (q = "") => {
    const tb = document.getElementById("adminUserTableBody"); if(!tb) return; tb.innerHTML = ""; 
    let fUsers = q.trim() !== "" ? users.filter(u => (u.name&&u.name.toLowerCase().includes(q.toLowerCase())) || (u.username&&u.username.toLowerCase().includes(q.toLowerCase()))) : users;
    if (fUsers.length === 0) { tb.innerHTML = `<tr><td colspan="4" style="text-align:center;">ไม่พบรายชื่อ</td></tr>`; return; }
    fUsers.forEach((u) => {
        const badge = u.role === 'admin' ? `<span style="background:#ff9800; color:#fff; padding:3px 10px; border-radius:15px; font-size:12px;">Admin</span>` : `<span style="background:#444; color:#fff; padding:3px 10px; border-radius:15px; font-size:12px;">User</span>`;
        
        let btns = currentUser && currentUser.id === u.id 
            ? `<span style="color:#888;">(คุณเอง)</span>` 
            : `<button onclick="changeUserRole('${u.id}', '${u.role}')" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer; margin-right:5px;">สลับสิทธิ์</button>
               <button onclick="deleteUser('${u.id}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;"><i class="fas fa-trash"></i> ลบ</button>`;
               
        tb.innerHTML += `<tr><td style="padding:12px;">${u.name||"-"}</td><td style="padding:12px;">${u.username}</td><td style="padding:12px;">${badge}</td><td style="padding:12px;">${btns}</td></tr>`;
    });
}
window.changeUserRole = async (id, r) => { await updateDoc(doc(db, "users", id), { role: r === 'admin' ? 'user' : 'admin' }); }
window.deleteUser = async (id) => { if((await Swal.fire({title:'ลบผู้ใช้?',icon:'error',showCancelButton:true, background:'#1a1a1a',color:'#fff'})).isConfirmed){ await deleteDoc(doc(db, "users", id)); } }
window.exportToCSV = async () => {
    const snap = await getDocs(collection(db, "requests")); let csv = "\uFEFFวันที่,ผู้ยืม,อุปกรณ์,วันที่รับ,สถานะ\n";
    snap.forEach(d => { let data=d.data(); let t=data.timestamp?(data.timestamp.toDate?data.timestamp.toDate().toLocaleString('th-TH'):new Date(data.timestamp).toLocaleString('th-TH')):"-"; csv+=`"${t}","${data.user}","${data.item.replace(/"/g,'""')}","${data.date}","${data.status}"\n`; });
    const b = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const l = document.createElement("a"); l.href = URL.createObjectURL(b); l.download = `MMD_Report.csv`; document.body.appendChild(l); l.click(); document.body.removeChild(l);
}

/* ==========================================
   🔥 INIT APP (อัปเดตบันทึกวันคืนลง Database) 🔥
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
            window.listenToData(); window.updateCartCount();
            if(document.getElementById('cartForm')) {
                document.getElementById('cartForm').onsubmit = async (e) => {
                    e.preventDefault(); 
                    const d = document.getElementById('cartBorrowDate').value; 
                    const retD = document.getElementById('cartReturnDate').value; // วันคืน
                    const r = document.getElementById('cartReason').value; 
                    const btn = document.querySelector('#cartForm button[type="submit"]');
                    
                    if(new Date(d) < new Date().setHours(0,0,0,0)) return Swal.fire('วันที่ผิด', 'ห้ามย้อนหลัง', 'error');
                    if(new Date(retD) < new Date(d)) return Swal.fire('วันที่ผิด', 'วันคืนของต้องไม่ก่อนวันรับของ', 'error');

                    try {
                        btn.disabled = true; const itms = cart.map(i => `${i.name} (${i.qty} ชิ้น)`).join(', ');
                        await addDoc(collection(db, "requests"), { 
                            user: currentUser.name||currentUser.username, 
                            userId: currentUser.id, 
                            item: itms, 
                            date: d, 
                            returnDate: retD, // บันทึกวันคืนลงฐานข้อมูล
                            reason: r||"-", 
                            status: "pending", 
                            timestamp: new Date() 
                        });
                        fetch(LINE_API_URL, { method:'POST', mode:'no-cors', body:JSON.stringify({ user: currentUser.name, item: itms, date: `${d} คืน ${retD}` }) }).catch(e=>e);
                        Swal.fire({ icon: 'success', title: 'จองสำเร็จ!', timer: 2500, showConfirmButton: false }); cart = []; window.updateCartCount(); window.renderItems(); window.closeCartModal();
                    } catch(e) { Swal.fire('Error', e.message, 'error'); } finally { btn.disabled = false; }
                };
            }
            const p = document.getElementById('pickupProofInput'); if(p) p.onchange = async (e) => { const file = e.target.files[0]; if(!file) return; Swal.fire({title:'อัปโหลด...', allowOutsideClick:false, didOpen:()=>Swal.showLoading()}); try{ const b = await resizeImage(file); await updateDoc(doc(db, "requests", currentPickupId), { status: "borrowed", proofPhoto: b, pickupTime: new Date() }); Swal.fire({icon:'success',title:'สำเร็จ!',timer:2000,showConfirmButton:false}); e.target.value=''; window.openHistoryModal(); }catch(err){Swal.fire('Error',err.message,'error');} };
            const ret = document.getElementById('returnProofInput'); if(ret) ret.onchange = async (e) => { const file = e.target.files[0]; if(!file) return; Swal.fire({title:'อัปโหลด...', allowOutsideClick:false, didOpen:()=>Swal.showLoading()}); try{ const b = await resizeImage(file); await updateDoc(doc(db, "requests", currentReturnId), { status: "pending_return", returnProofPhoto: b, returnTime: new Date() }); Swal.fire({icon:'success',title:'สำเร็จ!',timer:2000,showConfirmButton:false}); e.target.value=''; window.openHistoryModal(); }catch(err){Swal.fire('Error',err.message,'error');} };
        }
    }
    else if(document.getElementById('section-requests')) { const user = window.checkAuth(); if(user){ if(user.role !== 'admin') { Swal.fire('ปฏิเสธ', 'เฉพาะ Admin', 'error').then(()=>window.location.href='dashboard.html'); } else { window.listenToData(); document.getElementById('section-requests').style.display = 'block'; } } }
}
initApp();