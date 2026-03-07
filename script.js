/* =========================================
   script.js - MMD BORROW SYSTEM (FULL + ADMIN + CART)
   ========================================= */

// 1. นำเข้า Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. ตั้งค่า EmailJS
try {
    emailjs.init("Rj2WpB-v7fZqvEu08");
} catch (e) {
    console.warn("⚠️ EmailJS ยังไม่ถูกโหลด");
}

// 3. ลิงก์ LINE Notify
const LINE_API_URL = "https://script.google.com/macros/s/AKfycbzw0gLpeZEdB8rUofNdPTLKHBQYhfcYcD1S72t_PRI-tSfdfi2-ZqGUw-Hwa4wRP17crg/exec";

// 4. การตั้งค่า Firebase (ของกาย)
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
let items = [];
let borrowRequests = [];
let users = [];
let cart = []; // 🔥 เพิ่มตัวแปรตะกร้าสินค้า
let currentPickupId = null;

/* --- Helper: ระบบย่อรูป --- */
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

/* --- Helper: Popup ดูรูป --- */
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
        Swal.fire({ icon: 'info', title: 'ไม่พบรูปภาพ', text: 'รายการนี้ยังไม่มีรูปภาพหลักฐาน' });
    }
}

/* --- PART 1: Data Logic --- */
function listenToData() {
    onSnapshot(collection(db, "items"), (snapshot) => {
        items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('index.html')) renderItems();
        if(window.location.pathname.includes('admin.html')) { renderInventory(); updateDashboardStats(); }
    });

    onSnapshot(collection(db, "requests"), (snapshot) => {
        borrowRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('index.html')) renderItems(); 
        if(window.location.pathname.includes('admin.html')) { renderRequests(); renderInventory(); updateDashboardStats(); }
    });

    onSnapshot(collection(db, "users"), (snapshot) => {
        users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('admin.html')) {
            if(window.loadUsersToAdminTable) window.loadUsersToAdminTable();
        }
    });
}

/* --- PART 2: Auth System --- */
window.checkAuth = function() {
    if (!currentUser) { 
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html'; 
        }
        return null; 
    }
    
    const display = document.getElementById('userNameDisplay') || document.querySelector('.user-info span') || document.querySelector('.admin-profile span');
    if(display) display.innerText = currentUser.name || currentUser.username;
    
    // จัดการปุ่ม Admin
    if (currentUser.role === 'admin') {
        const btnAdminManage = document.getElementById('btnAdminManage');
        if (btnAdminManage) btnAdminManage.style.display = 'inline-flex';
    }

    return currentUser;
}

window.login = async function(u, p) {
    Swal.fire({ title: 'กำลังเข้าสู่ระบบ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
    try {
        const q = query(collection(db, "users"), where("username", "==", u), where("password", "==", p));
        const qs = await getDocs(q);
        
        if (!qs.empty) {
            const d = qs.docs[0].data(); 
            d.id = qs.docs[0].id;
            localStorage.setItem('currentUser', JSON.stringify(d));
            
            await Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'ยินดีต้อนรับคุณ ' + (d.name || d.username), timer: 1500, showConfirmButton: false });
            window.location.reload();
        } else { 
            Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบล้มเหลว', text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message });
    }
}

window.register = async function(u, p, n) {
    try {
        const q = query(collection(db, "users"), where("username", "==", u));
        if (!(await getDocs(q)).empty) { 
            Swal.fire({ icon: 'warning', title: 'สมัครไม่ได้', text: 'มีชื่อผู้ใช้นี้ในระบบแล้ว' });
            return; 
        }
        await addDoc(collection(db, "users"), { username: u, password: p, role: "user", name: n });
        Swal.fire({ icon: 'success', title: 'สมัครสำเร็จ!', text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่', timer: 2000, showConfirmButton: false });
        toggleForm();
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: e.message });
    }
}

window.logout = () => { 
    Swal.fire({
        title: 'ออกจากระบบ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ออกจากระบบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('currentUser'); 
            window.location.reload(); 
        }
    });
}

if(document.getElementById('loginForm')) {
    window.toggleForm = () => { document.getElementById('loginForm').classList.toggle('hidden'); document.getElementById('registerForm').classList.toggle('hidden'); }
    document.getElementById('loginForm').onsubmit = (e) => { e.preventDefault(); login(document.getElementById('username').value, document.getElementById('password').value); };
    document.getElementById('registerForm').onsubmit = (e) => { e.preventDefault(); register(document.getElementById('regUser').value, document.getElementById('regPass').value, document.getElementById('regName').value); };
    
    if(currentUser) {
        document.querySelector('.login-wrapper').style.display = 'none'; 
        listenToData(); 
        window.onload = () => checkAuth();
    }
}

// ==========================================
// 🔥 USER DASHBOARD & CART SYSTEM 🔥
// ==========================================
if(document.getElementById('itemGrid') && currentUser) {
    
    // โหลดของมาโชว์ใน Grid
    window.renderItems = (cat = 'all') => {
        const grid = document.getElementById('itemGrid'); if(!grid) return; grid.innerHTML = '';
        items.forEach(item => {
            if(cat !== 'all' && item.category !== cat) return;
            
            // 🔥 เช็คว่าของชิ้นนี้ถูกยืมไปแล้ว หรืออยู่ในตะกร้าของเรา
            const isBorrowed = borrowRequests.some(r => (r.item && r.item.includes(item.name)) && (r.status === 'borrowed' || r.status === 'approved_pickup'));
            const inCart = cart.some(c => c.id === item.id);
            
            let status = isBorrowed ? 'borrowed' : (inCart ? 'incart' : 'available');
            let btnClass = status === 'available' ? 'btn-borrow' : 'btn-disabled';
            let btnText = status === 'available' ? '<i class="fas fa-cart-plus"></i> ลงตะกร้า' : (inCart ? 'อยู่ในตะกร้าแล้ว' : 'ไม่ว่าง');
            let btnAction = status === 'available' ? `addToCart('${item.id}', '${item.name}')` : '';
            
            let badgeText = status === 'available' ? 'ว่าง' : (inCart ? 'เลือกแล้ว' : 'ถูกยืม');
            
            grid.innerHTML += `<div class="card"><div class="card-img"><img src="${item.image}"><div class="status-badge ${status}">${badgeText}</div></div><div class="card-body"><h4>${item.name}</h4><span class="category-tag">${item.category.toUpperCase()}</span><button class="${btnClass}" onclick="${btnAction}">${btnText}</button></div></div>`;
        });
    }

    // ฟังก์ชันตะกร้าสินค้า
    window.addToCart = function(id, name) {
        cart.push({ id, name });
        updateCartCount();
        renderItems(); 
        Swal.fire({icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว', showConfirmButton: false, timer: 1000, position: 'top-end', toast: true});
    }

    window.updateCartCount = function() {
        const badge = document.getElementById('cartCountBadge');
        if(badge) badge.innerText = cart.length;
    }

    window.openCartModal = function() {
        if(cart.length === 0) {
            Swal.fire('ตะกร้าว่างเปล่า', 'กรุณาเลือกอุปกรณ์ก่อนทำการจอง', 'info');
            return;
        }
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

        const listDiv = document.getElementById('cartItemsList');
        listDiv.innerHTML = cart.map((item, index) =>
            `<div style="display:flex; justify-content:space-between; color:white; padding:8px 0; border-bottom:1px solid #444;">
                <span>${index+1}. ${item.name}</span>
                <button type="button" onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:#dc3545; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>`
        ).join('');

        document.getElementById('cartModal').style.display = 'flex';
    }

    window.removeFromCart = function(id) {
        cart = cart.filter(i => i.id !== id);
        updateCartCount();
        renderItems();
        if(cart.length === 0) closeCartModal(); else openCartModal();
    }
    
    window.closeCartModal = () => document.getElementById('cartModal').style.display = 'none';

    // ยืนยันจองของในตะกร้า (หลายชิ้น)
    if(document.getElementById('cartForm')) {
        document.getElementById('cartForm').onsubmit = async (e) => {
            e.preventDefault();
            const date = document.getElementById('cartBorrowDate').value;
            const reason = document.getElementById('cartReason').value;
            const submitBtn = document.querySelector('#cartForm button[type="submit"]');

            const selectedDate = new Date(date); selectedDate.setHours(0,0,0,0);
            const today = new Date(); today.setHours(0,0,0,0);
            const maxAllowedDate = new Date(today); maxAllowedDate.setDate(today.getDate() + 5);

            if(selectedDate < today) { Swal.fire({ icon: 'error', title: 'วันที่ไม่ถูกต้อง', text: 'ไม่สามารถเลือกวันที่ย้อนหลังได้ครับ' }); return; }
            if(selectedDate > maxAllowedDate) { Swal.fire({ icon: 'error', title: 'วันที่ไม่ถูกต้อง', text: 'สามารถจองล่วงหน้าได้ไม่เกิน 5 วันครับ' }); return; }

            try {
                submitBtn.innerHTML = "⏳ กำลังบันทึก...";
                submitBtn.disabled = true;

                // รวมชื่ออุปกรณ์ เช่น "กล้อง Sony, ขาตั้งกล้อง, ไมค์"
                const itemNamesStr = cart.map(i => i.name).join(', ');

                await addDoc(collection(db, "requests"), { 
                    user: currentUser.name || currentUser.username, 
                    userId: currentUser.id, 
                    item: itemNamesStr, 
                    date: date, 
                    reason: reason || "-",
                    status: "pending", 
                    proofPhoto: null, 
                    timestamp: new Date() 
                });
                
                fetch(LINE_API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ user: currentUser.name || currentUser.username, item: itemNamesStr, date: date })
                }).catch(err => console.error("Line Error", err));

                const emailParams = {
                    user_name: currentUser.name || currentUser.username,
                    item_name: itemNamesStr,
                    borrow_date: date,
                    status: 'pending'
                };
                if(typeof emailjs !== 'undefined') {
                    emailjs.send("service_8q17oo9", "template_4ch9467", emailParams);
                }

                Swal.fire({ icon: 'success', title: 'ส่งคำขอจองสำเร็จ!', text: 'ระบบได้แจ้งเตือนไปยัง Admin แล้ว โปรดรอการอนุมัติ', timer: 2500, showConfirmButton: false });
                
                cart = []; // เคลียร์ตะกร้า
                updateCartCount();
                renderItems();
                closeCartModal();

            } catch(e) { 
                Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: e.message });
            } finally {
                submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> ยืนยันการจองทั้งหมด';
                submitBtn.disabled = false;
            }
        };
    }

    // รับของ (Upload Proof)
    window.triggerPickup = (reqId) => {
        currentPickupId = reqId;
        const fileInput = document.getElementById('pickupProofInput');
        if(fileInput) fileInput.click();
        else Swal.fire('Error', 'ไม่พบช่องอัปโหลดไฟล์', 'error');
    }

    const pickupInput = document.getElementById('pickupProofInput');
    if(pickupInput) {
        pickupInput.onchange = async (e) => {
            const file = e.target.files[0];
            if(!file || !currentPickupId) return;
            
            Swal.fire({ title: 'กำลังอัปโหลดรูปภาพ...', text: 'โปรดรอสักครู่', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
            
            try {
                const base64 = await resizeImage(file);
                await updateDoc(doc(db, "requests", currentPickupId), {
                    status: "borrowed",
                    proofPhoto: base64,
                    pickupTime: new Date()
                });
                Swal.fire({ icon: 'success', title: 'รับของสำเร็จ!', text: 'สถานะเปลี่ยนเป็น กำลังถูกยืม เรียบร้อยแล้ว', timer: 2000, showConfirmButton: false });
                e.target.value = ''; 
                openHistoryModal(); 
            } catch(err) {
                Swal.fire({ icon: 'error', title: 'อัปโหลดไม่สำเร็จ', text: err.message });
            }
        };
    }

    // แสดงประวัติ
    window.openHistoryModal = () => {
        const tbody = document.getElementById('historyTableBody'); tbody.innerHTML = '';
        const myReqs = borrowRequests.filter(r => r.user === (currentUser.name||currentUser.username)).sort((a,b) => {
             const tA = a.timestamp && a.timestamp.seconds ? a.timestamp.seconds : 0;
             const tB = b.timestamp && b.timestamp.seconds ? b.timestamp.seconds : 0;
             return tB - tA;
        });

        if (myReqs.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">ไม่มีประวัติ</td></tr>';
        else myReqs.forEach(r => {
            let statusBadge = '';
            let actionBtn = '-';
            if(r.status === 'pending') {
                statusBadge = '<span style="color:#ffc107">⏳ รออนุมัติ</span>';
            } else if (r.status === 'approved_pickup') {
                statusBadge = '<span style="color:#0dcaf0">📦 รอรับของ</span>';
                actionBtn = `<button onclick="triggerPickup('${r.id}')" class="btn-confirm" style="padding:5px 10px; font-size:12px;">📷 ยืนยันรับของ</button>`;
            } else if (r.status === 'borrowed') {
                statusBadge = '<span style="color:#198754">✅ กำลังยืม</span>';
                actionBtn = `<button onclick="viewPhoto('${r.id}')" style="background:none; border:none; color:var(--theme-primary); cursor:pointer; text-decoration:underline;">ดูรูปรับของ</button>`;
            } else if (r.status === 'returned') {
                statusBadge = '<span style="color:#aaa">↩️ คืนแล้ว</span>';
            } else {
                statusBadge = '<span style="color:red">❌ ปฏิเสธ</span>';
            }
            tbody.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333">${r.item}</td><td style="padding:10px; border-bottom:1px solid #333">${r.date}</td><td style="padding:10px; border-bottom:1px solid #333">${statusBadge}</td><td style="padding:10px; border-bottom:1px solid #333">${actionBtn}</td></tr>`;
        });
        document.getElementById('historyModal').style.display = 'flex';
    }
    window.closeHistoryModal = () => document.getElementById('historyModal').style.display = 'none';
    window.filterItems = (cat) => { document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); renderItems(cat); }
    window.searchItem = (t) => { Array.from(document.getElementsByClassName('card')).forEach(c => c.style.display = c.querySelector('h4').innerText.toLowerCase().includes(t.toLowerCase()) ? 'flex' : 'none'); }
}


// ==========================================
// 🔥 ADMIN SYSTEM LOGIC 🔥
// ==========================================
if(window.location.pathname.includes('admin.html')) {
    listenToData(); window.onload = () => { checkAuth(); updateDashboardStats(); document.getElementById('section-requests').style.display = 'block'; }
    window.switchTab = (t) => { document.querySelectorAll('.content-section').forEach(e => e.style.display = 'none'); document.querySelectorAll('.sidebar-menu a').forEach(e => e.classList.remove('active')); document.getElementById(`section-${t}`).style.display = 'block'; document.getElementById(`menu-${t}`).classList.add('active'); if(t==='requests') renderRequests(); if(t==='inventory') renderInventory(); if(t==='users') { if(window.loadUsersToAdminTable) window.loadUsersToAdminTable(); } }

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
                photoDisplay = `<button onclick="viewPhoto('${r.id}')" style="background:none; border:none; color:#ff6600; cursor:pointer; font-weight:bold; text-decoration:underline;">📷 รูปรับของ</button>`;
            } else { photoDisplay = '-'; }

            if(r.status === 'pending') {
                badge = '<span class="badge status-pending">คำขอใหม่</span>';
                btns = `<button class="btn-action" style="background:#28a745;" onclick="updateStatus('${r.id}','approved_pickup')">อนุญาตให้มารับ</button>
                        <button class="btn-action btn-reject" onclick="updateStatus('${r.id}','rejected')">ปฏิเสธ</button>`;
            } else if (r.status === 'approved_pickup') {
                badge = '<span class="badge" style="background:#0dcaf0; color:black;">รอรับของ</span>';
                btns = '<span style="font-size:12px; color:#aaa;">รอ User ถ่ายรูป...</span>';
            } else if(r.status === 'borrowed') {
                badge = '<span class="badge status-approved">กำลังถูกยืม</span>';
                btns = `<button class="btn-action" style="background:#0099cc; color:white" onclick="updateStatus('${r.id}','returned')">รับคืน</button>`;
            } else { 
                badge = `<span class="badge" style="background:#333; color:#aaa">${r.status}</span>`; 
                btns = `<button class="btn-action btn-reject" onclick="deleteRequest('${r.id}')" title="ลบ"><i class="fas fa-trash"></i></button>`; 
            }
            tbody.innerHTML += `<tr><td>${r.user}</td><td>${r.item}</td><td>${r.date}</td><td>${badge}</td><td>${photoDisplay}</td><td>${btns}</td></tr>`;
        });
    }

    window.deleteRequest = async (id) => { 
        const result = await Swal.fire({ title: 'ยืนยันการลบ?', text: "ประวัตินี้จะถูกลบถาวร!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'ลบเลย', cancelButtonText: 'ยกเลิก' });
        if(result.isConfirmed) { await deleteDoc(doc(db, "requests", id)); Swal.fire('ลบแล้ว!', '', 'success'); }
    }
    window.updateStatus = async (id, s) => { try { await updateDoc(doc(db, "requests", id), { status: s }); } catch(e) { Swal.fire('Error', e.message, 'error'); } }
    
    window.renderInventory = () => { 
        const tbody = document.getElementById('inventoryTableBody'); 
        if(!tbody) return;
        tbody.innerHTML = ''; 
        items.forEach(i => { 
            // เช็คการยืมแบบ string.includes() เพื่อรองรับระบบตะกร้า
            const st = borrowRequests.some(r => r.item && r.item.includes(i.name) && (r.status === 'borrowed' || r.status === 'approved_pickup')) 
                ? '<span style="color:var(--danger)">ไม่ว่าง</span>' 
                : '<span style="color:var(--success)">ว่าง</span>'; 
            tbody.innerHTML += `<tr><td><img src="${i.image}" width="40"></td><td style="color:white">${i.name}</td><td>${i.category}</td><td>${st}</td><td><button onclick="deleteItem('${i.id}')" class="btn-action btn-reject"><i class="fas fa-trash"></i></button></td></tr>`; 
        }); 
    }
    
    window.addNewItem = async () => { 
        const { value: n } = await Swal.fire({ title: 'เพิ่มอุปกรณ์ใหม่', input: 'text', inputLabel: 'ชื่ออุปกรณ์', inputPlaceholder: 'พิมพ์ชื่ออุปกรณ์ที่นี่...', showCancelButton: true });
        if(n) { await addDoc(collection(db, "items"), { name: n, category: "general", status: "available", image: "https://placehold.co/100" }); Swal.fire('สำเร็จ', 'เพิ่มอุปกรณ์แล้ว', 'success'); }
    }
    window.deleteItem = async (id) => { 
        const result = await Swal.fire({ title: 'ลบอุปกรณ์นี้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก' });
        if(result.isConfirmed) { await deleteDoc(doc(db, "items", id)); Swal.fire('ลบแล้ว!', '', 'success'); }
    }
    
    window.updateDashboardStats = () => { 
        const elPending = document.getElementById('stat-pending');
        const elBorrowed = document.getElementById('stat-borrowed');
        const elTotal = document.getElementById('stat-total-items');
        if(elPending) elPending.innerText = borrowRequests.filter(r => r.status === 'pending').length; 
        if(elBorrowed) elBorrowed.innerText = borrowRequests.filter(r => r.status === 'borrowed').length; 
        if(elTotal) elTotal.innerText = items.length; 
    }

    // --- Admin Role Mgmt ---
    window.loadUsersToAdminTable = function() {
        const tableBody = document.getElementById("adminUserTableBody");
        if(!tableBody) return;
        tableBody.innerHTML = ""; 
        if (users.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>กำลังโหลดข้อมูล...</td></tr>";
            return;
        }
        users.forEach((u) => {
            const userName = u.name || "ไม่มีชื่อ";
            const userEmail = u.username || "-";
            const currentRole = u.role || "user"; 
            const roleBadge = currentRole === 'admin' 
                ? `<span style="background:#ff9800; color:#fff; padding:3px 10px; border-radius:15px; font-size:12px;"><i class="fas fa-crown"></i> Admin</span>`
                : `<span style="background:#444; color:#fff; padding:3px 10px; border-radius:15px; font-size:12px;">User</span>`;
            
            let actionBtn = "";
            if (currentUser && currentUser.id === u.id) {
                actionBtn = `<span style="color: #888; font-size: 12px;">(ตัวคุณเอง)</span>`;
            } else {
                actionBtn = `<button onclick="window.changeUserRole('${u.id}', '${currentRole}', '${userName}')" 
                    style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; transition: 0.2s;">
                    <i class="fas fa-exchange-alt"></i> เปลี่ยนสิทธิ์
                </button>`;
            }
            const row = `<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding:12px;">${userName}</td>
                <td style="padding:12px;">${userEmail}</td>
                <td style="padding:12px;">${roleBadge}</td>
                <td style="padding:12px;">${actionBtn}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    window.changeUserRole = async function(userId, currentRole, userName) {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const actionText = newRole === 'admin' ? 'เลื่อนขั้นเป็น Admin' : 'ปลดเป็นนักศึกษาทั่วไป';
        const result = await Swal.fire({
            title: 'ยืนยันการเปลี่ยนสิทธิ์?',
            html: `คุณต้องการ <b>${actionText}</b> ให้กับ <br/><span style="color:#ff9800">${userName}</span> ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff9800',
            cancelButtonColor: '#444',
            confirmButtonText: 'ยืนยันการเปลี่ยน',
            cancelButtonText: 'ยกเลิก',
            background: '#1a1a1a',
            color: '#fff'
        });
        if (result.isConfirmed) {
            try {
                const userRef = doc(db, "users", userId);
                await updateDoc(userRef, { role: newRole });
                Swal.fire({ title: 'สำเร็จ!', text: `เปลี่ยนสิทธิ์ของ ${userName} เรียบร้อยแล้ว`, icon: 'success', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
            } catch (error) {
                console.error("Error updating role: ", error);
                Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถเปลี่ยนสิทธิ์ได้', 'error');
            }
        }
    }
}

// ฟังก์ชัน Export CSV
window.exportToCSV = async function() {
    try {
        Swal.fire({ title: 'กำลังเตรียมรายงาน...', timer: 1000, timerProgressBar: true, didOpen: () => { Swal.showLoading(); }});

        const querySnapshot = await getDocs(collection(db, "requests"));
        let csvContent = "\uFEFF"; 
        csvContent += "วันที่ส่งคำขอ,ชื่อผู้ยืม,อุปกรณ์ที่ยืม,วันที่ต้องการยืม,สถานะ\n";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let timeString = "-";
            if(data.timestamp && data.timestamp.toDate) {
                timeString = data.timestamp.toDate().toLocaleString('th-TH');
            } else if (data.timestamp) {
                timeString = new Date(data.timestamp).toLocaleString('th-TH');
            }

            const userName = data.user || "-"; 
            const itemName = data.item || "-"; 
            const borrowDate = data.date || "-"; 
            const status = data.status || "-";

            let statusThai = status;
            if(status === 'pending') statusThai = "รออนุมัติ";
            else if(status === 'approved_pickup') statusThai = "รอรับ বিন্দু";
            else if(status === 'borrowed') statusThai = "กำลังยืม";
            else if(status === 'returned') statusThai = "คืนแล้ว";
            else if(status === 'rejected') statusThai = "ถูกปฏิเสธ";

            // ป้องกันปัญหาการตัดคำผิดพลาดจากคอมม่าในตะกร้าสินค้า
            csvContent += `"${timeString}","${userName}","${itemName.replace(/"/g, '""')}","${borrowDate}","${statusThai}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `MMD_Borrow_Report_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            Swal.fire({ icon: 'success', title: 'ดาวน์โหลดรายงานสำเร็จ!', showConfirmButton: false, timer: 1500 });
        }, 1000);

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถดาวน์โหลดรายงานได้ กรุณาลองใหม่' });
    }
}