/* =========================================
   script.js - MMD BORROW SYSTEM (MEGA UPDATE + PREMIUM UI + LEADERBOARD + ADVANCED RETURN INSPECTION + MODERN LIST UI + GLOWING HEADER + SWEETALERT DARK THEME + MOBILE RESPONSIVE)
   ========================================= */

// 🟢 คำสั่งจัดหน้าจอ, ล็อกความกว้างไม่ให้ทะลุจอ และตกแต่ง UI ใหม่
if (!document.getElementById('dynamic-ui-css')) {
    const style = document.createElement('style');
    style.id = 'dynamic-ui-css';
    style.innerHTML = `
        /* 🟢 1. อัปเกรดดีไซน์ Header (Glassmorphism + Neon Border) */
        header, .navbar, .top-nav, .header-container {
            background: rgba(15, 15, 15, 0.85) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-bottom: 1px solid rgba(255, 102, 0, 0.25) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 2px 15px rgba(255, 102, 0, 0.08) !important;
            position: sticky !important; 
            top: 0 !important; 
            z-index: 1000 !important;
        }

        #userNameDisplay, .logo, .navbar-brand {
            background: linear-gradient(to right, #ffffff, #ff9800) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            font-weight: 700 !important;
            letter-spacing: 0.5px;
            text-shadow: 0 2px 10px rgba(255, 152, 0, 0.2);
        }

        @keyframes pulseOrange {
            0% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(255, 102, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0); }
        }
        @keyframes pulseGreen {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }

        #btnAdminManage {
            background: linear-gradient(135deg, #ff7b00, #cc4400) !important;
            color: #fff !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 30px !important;
            padding: 8px 22px !important;
            font-weight: bold !important;
            animation: pulseOrange 2.5s infinite !important;
            transition: all 0.3s ease !important;
        }
        #btnAdminManage:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px rgba(255, 152, 0, 0.6) !important; }

        button[onclick="openCartModal()"], .cart-btn {
            background: linear-gradient(135deg, #28a745, #198754) !important;
            color: #fff !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 30px !important;
            padding: 8px 22px !important;
            font-weight: bold !important;
            animation: pulseGreen 2.5s infinite !important;
            transition: all 0.3s ease !important;
        }
        button[onclick="openCartModal()"]:hover, .cart-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6) !important; }

        button[onclick="window.openHistoryModal()"], button[onclick="openHistoryModal()"] {
            background: linear-gradient(135deg, #333, #111) !important;
            color: #fff !important;
            border: 1px solid #555 !important;
            border-radius: 30px !important;
            padding: 8px 22px !important;
            font-weight: bold !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4) !important;
            transition: all 0.3s ease !important;
        }
        button[onclick="window.openHistoryModal()"]:hover, button[onclick="openHistoryModal()"]:hover {
            border-color: #ff9800 !important;
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(255, 152, 0, 0.3) !important;
        }

        /* 🟢 2. โค้ดส่วน Scroll และ Inputs ทั่วไป */
        .category-scroll { 
            display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; gap: 12px !important; padding: 5px 5px 15px 5px !important; justify-content: flex-start !important; scrollbar-width: none !important; -ms-overflow-style: none !important; scroll-behavior: smooth !important; -webkit-overflow-scrolling: touch !important; cursor: grab !important; max-width: 100% !important; box-sizing: border-box !important;
        }
        .category-scroll:active { cursor: grabbing !important; }
        .category-scroll::-webkit-scrollbar { display: none; }
        .category-scroll button { white-space: nowrap !important; flex-shrink: 0 !important; user-select: none !important; -webkit-user-select: none !important; pointer-events: auto; }

        .premium-input { width: 100% !important; margin: 0 !important; box-sizing: border-box !important; background-color: #111 !important; color: #fff !important; border: 1px solid #444 !important; border-radius: 8px !important; padding: 12px 15px !important; font-size: 14px !important; transition: all 0.3s ease !important; }
        .premium-input:focus { border-color: #ff6600 !important; background-color: #1a1a1a !important; box-shadow: 0 0 0 3px rgba(255,102,0,0.2) !important; outline: none !important; }
        .premium-input::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
        .premium-input::-webkit-calendar-picker-indicator:hover { filter: invert(1); }
        textarea.premium-input { resize: vertical; min-height: 80px; }
        select.premium-input { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23AAAAAA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 15px top 50%; background-size: 12px auto; }

        .data-table { border-collapse: separate !important; border-spacing: 0 10px !important; border: none !important; }
        .data-table thead th { background: #151515 !important; position: sticky !important; top: 0 !important; z-index: 20 !important; border: none !important; color: #888 !important; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; padding: 15px !important; box-shadow: 0 5px 10px rgba(0,0,0,0.3); }
        .data-table tbody tr { background: #1e1e1e !important; box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important; transition: transform 0.2s, box-shadow 0.2s; }
        .data-table tbody tr:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,102,0,0.1) !important; background: #222 !important; }
        .data-table tbody td { border: none !important; border-top: 1px solid #2d2d2d !important; border-bottom: 1px solid #2d2d2d !important; vertical-align: top; padding: 15px !important; }
        .data-table tbody td:first-child { border-left: 1px solid #2d2d2d !important; border-radius: 8px 0 0 8px !important; }
        .data-table tbody td:last-child { border-right: 1px solid #2d2d2d !important; border-radius: 0 8px 8px 0 !important; }

        /* 🟢 3. อัปเกรด SweetAlert2 ให้เป็น Dark/Premium Theme */
        .swal-popup-dark {
            border: 1px solid rgba(255, 102, 0, 0.2) !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(255,102,0,0.15) !important;
            border-radius: 16px !important;
        }
        .swal-actions-gap { gap: 15px !important; }
        .swal-btn-confirm {
            background: linear-gradient(135deg, #ff6600, #e65100) !important;
            color: #fff !important;
            border-radius: 30px !important;
            padding: 10px 30px !important;
            font-size: 15px !important;
            font-weight: bold !important;
            border: none !important;
            box-shadow: 0 4px 15px rgba(255, 102, 0, 0.4) !important;
            cursor: pointer;
            transition: 0.3s ease;
        }
        .swal-btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 102, 0, 0.6) !important; }
        
        .swal-btn-cancel {
            background: #333 !important;
            color: #ddd !important;
            border-radius: 30px !important;
            padding: 10px 30px !important;
            font-size: 15px !important;
            font-weight: bold !important;
            border: 1px solid #555 !important;
            cursor: pointer;
            transition: 0.3s ease;
        }
        .swal-btn-cancel:hover { background: #444 !important; border-color: #666 !important; color: #fff !important; }
        
        input.swal2-input:focus { border-color: #ff6600 !important; box-shadow: 0 0 0 3px rgba(255,102,0,0.2) !important; }

        /* 🟢 4. Mobile Responsive (จัดระเบียบ Header ในมือถือ) */
        @media screen and (max-width: 768px) {
            header, .navbar, .top-nav, .header-container {
                padding: 10px 8px !important;
            }
            /* ลดขนาดฟอนต์ของโลโก้ */
            .navbar-brand, .logo, h1, h2, h3 {
                font-size: 18px !important;
                margin-bottom: 5px !important;
            }
            /* จัดการชื่อผู้ใช้ให้ตัดคำและเล็กลง */
            #userNameDisplay {
                font-size: 12px !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                max-width: 140px !important;
                display: inline-block !important;
                vertical-align: middle !important;
            }
            /* ย่อขนาดปุ่มและช่องว่าง */
            #btnAdminManage, 
            button[onclick="openCartModal()"], .cart-btn,
            button[onclick="window.openHistoryModal()"], button[onclick="openHistoryModal()"] {
                padding: 6px 10px !important;
                font-size: 11px !important;
            }
            button[onclick="window.logout()"], button[onclick="logout()"] {
                padding: 6px 10px !important;
                font-size: 11px !important;
            }
            /* บังคับคอนเทนเนอร์ให้ชิดกันขึ้น */
            header div, .navbar div {
                gap: 5px !important;
                margin-bottom: 2px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function enableDragToScroll(slider) {
    if (!slider || slider.dataset.dragEnabled === "true") return;
    slider.dataset.dragEnabled = "true";

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => { isDown = false; });
    slider.addEventListener('mouseup', () => { isDown = false; });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; 
        slider.scrollLeft = scrollLeft - walk;
    });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker ลงทะเบียนสำเร็จ!', reg))
            .catch(err => console.error('Service Worker ลงทะเบียนไม่สำเร็จ:', err));
    });
}

try { emailjs.init("Rj2WpB-v7fZqvEu08"); } catch (e) { console.warn("⚠️ EmailJS ไม่ถูกโหลด"); }
const LINE_API_URL = "https://script.google.com/macros/s/AKfycby0x6cN3Od4U6b5kJunSgln-tTr8p6XZynfjDn1o089DbXcSgr67v10n1Bu-BJPkiJ6/exec";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/* --- Global Variables --- */
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let items = [], borrowRequests = [], users = [], cart = [];
let currentPickupId = null, currentReturnId = null;
let currentPage = 1; const itemsPerPage = 8; let searchQuery = "";
let borrowChartInstance = null, conditionChartInstance = null, userChartInstance = null; 
let currentCategory = 'all';
let adminCurrentCategory = 'all'; 

async function uploadToImgBB(base64Data) {
    const apiKey = '6b400d48dc08e690c88a8b32f3cef56a';
    const formData = new FormData();
    formData.append('image', base64Data);
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) { return data.data.url; } else { throw new Error('อัปโหลดรูปภาพล้มเหลว'); }
    } catch (error) { console.error("ImgBB Upload Error:", error); throw error; }
}

function getDisplayCategory(cat) {
    if(!cat) return "ไม่ระบุ";
    const map = { 'camera': 'กล้อง', 'tripod': 'ขาตั้ง/Gimbal', 'audio': 'เสียง', 'light': 'ไฟสตูดิโอ', 'general': 'ทั่วไป' };
    return map[cat.toLowerCase()] || cat;
}

if (!document.getElementById('returnProofInput')) {
    const returnInput = document.createElement('input'); returnInput.type = 'file'; returnInput.id = 'returnProofInput';
    returnInput.accept = 'image/*'; returnInput.style.display = 'none'; document.body.appendChild(returnInput);
}

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

function formatEquipList(rawStr) {
    if (!rawStr) return "-";
    let str = String(rawStr);
    let itemsPart = str;
    let groupPart = "";
    
    if (str.includes('\n[')) {
        let parts = str.split('\n[');
        itemsPart = parts[0];
        groupPart = '<div style="margin-top: 8px; font-size: 11px; color: #0dcaf0; background: rgba(13, 202, 240, 0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #0dcaf0;"><i class="fas fa-users"></i> [' + parts[1].replace(/\n/g, '<br>') + '</div>';
    }

    let html = itemsPart.split(',').map(item => {
        let t = item.trim();
        if(!t) return '';
        return `<div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; margin-bottom: 5px; font-size: 13px; display: flex; align-items: flex-start; gap: 10px; border-left: 3px solid var(--theme-primary);">
                    <i class="fas fa-check-circle" style="color: var(--theme-primary); font-size: 14px; margin-top: 2px;"></i> 
                    <span style="line-height: 1.4; color: #eee;">${t}</span>
                </div>`;
    }).join('');
    
    return `<div style="display: flex; flex-direction: column; min-width: 200px;">${html}${groupPart}</div>`;
}

const lightbox = document.createElement('div');
lightbox.id = 'lightbox-modal'; lightbox.style.cssText = 'display:none; position:fixed; z-index:99999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); justify-content:center; align-items:center; cursor:pointer; flex-direction:column;';
lightbox.innerHTML = `<img id="lightbox-img" style="max-width:90%; max-height:85%; border:2px solid white; box-shadow:0 0 20px black; object-fit:contain;"><p style="color:white; margin-top:10px;">แตะที่ว่างเพื่อปิด</p>`;
lightbox.onclick = () => lightbox.style.display = 'none'; document.body.appendChild(lightbox);

window.viewPhoto = function(reqId, type = 'pickup') {
    const req = borrowRequests.find(r => r.id === reqId);
    let photoData = (type === 'return') ? req.returnProofPhoto : req.proofPhoto;
    if (req && photoData) { document.getElementById('lightbox-img').src = photoData; document.getElementById('lightbox-modal').style.display = 'flex'; }
    else { Swal.fire({ icon: 'info', title: 'ไม่พบรูปภาพ', text: 'รายการนี้ยังไม่มีรูปภาพในระบบ', background: '#1a1a1a', color: '#fff' }); }
}

window.checkAuth = function() {
    if (!currentUser) { if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) { window.location.href = 'index.html'; } return null; }
    const display = document.getElementById('userNameDisplay'); if(display) display.innerText = currentUser.name || currentUser.username;
    const btnAdminManage = document.getElementById('btnAdminManage'); if (btnAdminManage) { btnAdminManage.style.display = currentUser.role === 'admin' ? 'inline-flex' : 'none'; }
    return currentUser;
}

window.login = async function(u, p) {
    Swal.fire({ title: 'เข้าสู่ระบบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff' });
    try {
        const qs = await getDocs(query(collection(db, "users"), where("username", "==", u), where("password", "==", p)));
        if (!qs.empty) { const d = qs.docs[0].data(); d.id = qs.docs[0].id; localStorage.setItem('currentUser', JSON.stringify(d)); await Swal.fire({ icon: 'success', title: 'สำเร็จ!', timer: 1500, showConfirmButton: false, background: '#1a1a1a', color: '#fff' }); window.location.href = 'dashboard.html'; }
        else { Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบล้มเหลว', text: 'รหัสผ่านไม่ถูกต้อง', background: '#1a1a1a', color: '#fff' }); }
    } catch (error) { Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message, background: '#1a1a1a', color: '#fff' }); }
}

window.loginWithGoogle = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userQuery = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
        let userData;
        
        if (userQuery.empty) {
            userData = { username: user.email.split('@')[0], email: user.email, name: user.displayName, role: "user" };
            const docRef = await addDoc(collection(db, "users"), userData);
            userData.id = docRef.id;
        } else {
            userData = userQuery.docs[0].data();
            userData.id = userQuery.docs[0].id;
        }
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        await Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ!', timer: 1500, showConfirmButton: false, background: '#1a1a1a', color: '#fff' });
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error("Google Login Error:", error);
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้', background: '#1a1a1a', color: '#fff' });
    }
}

window.register = async function(u, p, n) {
    try {
        if (!(await getDocs(query(collection(db, "users"), where("username", "==", u)))).empty) { Swal.fire({ icon: 'warning', title: 'ข้อมูลซ้ำ', text: 'มีผู้ใช้นี้แล้ว', background: '#1a1a1a', color: '#fff' }); return; }
        await addDoc(collection(db, "users"), { username: u, password: p, role: "user", name: n });
        Swal.fire({ icon: 'success', title: 'สมัครสำเร็จ!', timer: 2000, showConfirmButton: false, background: '#1a1a1a', color: '#fff' }); if(window.toggleForm) window.toggleForm();
    } catch (e) { Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: e.message, background: '#1a1a1a', color: '#fff' }); }
}

window.logout = () => Swal.fire({ title: 'ออกจากระบบ?', icon: 'question', showCancelButton: true, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#dc3545', confirmButtonText: 'ออกจากระบบ' }).then((res) => { if(res.isConfirmed){ localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }});

window.listenToData = function() {
    onSnapshot(collection(db, "items"), (snap) => { 
        items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
        window.renderCategories(); 
        if(document.getElementById('itemGrid')) window.renderItems(); 
        if(document.getElementById('inventoryTableBody')) window.renderInventory(); 
        if(window.updateDashboardStats) window.updateDashboardStats(); 
        if(document.getElementById('section-stats') && document.getElementById('section-stats').style.display === 'block') window.renderStats(); 
    }, (error) => console.error("Firebase Items Error:", error));
    
    onSnapshot(collection(db, "requests"), (snap) => { 
        borrowRequests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
        if(document.getElementById('itemGrid')) window.renderItems(); 
        if(document.getElementById('requestTableBody')) window.renderRequests(); 
        if(document.getElementById('inventoryTableBody')) window.renderInventory(); 
        if(window.updateDashboardStats) window.updateDashboardStats(); 
        if(document.getElementById('section-stats') && document.getElementById('section-stats').style.display === 'block') window.renderStats(); 
    }, (error) => console.error("Firebase Requests Error:", error));
    
    onSnapshot(collection(db, "users"), (snap) => { users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); if(document.getElementById('adminUserTableBody')) window.loadUsersToAdminTable(); });
}

window.renderCategories = () => {
    const filterContainer = document.querySelector('.filters');
    if (!filterContainer) return;
    
    filterContainer.classList.add('category-scroll');
    enableDragToScroll(filterContainer); 

    const normalizedCats = new Set(items.map(i => getDisplayCategory(i.category)));
    let uniqueCats = [...normalizedCats].filter(c => c && c !== 'ป้ายเหลือง'); 
    
    let normalCats = uniqueCats.filter(c => !c.startsWith('เซ็ต'));
    let specialCats = uniqueCats.filter(c => c.startsWith('เซ็ต'));

    normalCats.sort((a, b) => a.localeCompare(b, 'th'));
    specialCats.sort((a, b) => a.localeCompare(b, 'th'));

    uniqueCats = [...normalCats, ...specialCats];

    let baseBtnStyle = `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #bbb; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);`;

    let html = `<button onclick="filterItems('all')" style="${baseBtnStyle} ${currentCategory === 'all' ? 'background: linear-gradient(135deg, #ff6600, #e65100); color: #fff; border: none; box-shadow: 0 6px 15px rgba(255, 102, 0, 0.4); transform: translateY(-2px);' : ''}">ทั้งหมด</button>`;
    
    uniqueCats.forEach(cat => { 
        let isActive = currentCategory === cat;
        let inlineStyle = baseBtnStyle;
        
        if (cat === 'เซ็ตแดง') {
            inlineStyle = isActive 
                ? `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, #ff416c, #ff4b2b); color: #fff; border: none; box-shadow: 0 6px 15px rgba(255, 65, 108, 0.4); transform: translateY(-2px);` 
                : `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: rgba(220,53,69,0.05); color: #ff4b2b; border: 1px solid rgba(220,53,69,0.4);`;
        } else if (cat === 'เซ็ตเขียว') {
            inlineStyle = isActive 
                ? `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, #00b09b, #96c93d); color: #fff; border: none; box-shadow: 0 6px 15px rgba(0, 176, 155, 0.4); transform: translateY(-2px);` 
                : `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: rgba(40,167,69,0.05); color: #96c93d; border: 1px solid rgba(40,167,69,0.4);`;
        } else if (cat === 'เซ็ตเหลือง') {
            inlineStyle = isActive 
                ? `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, #f7971e, #ffd200); color: #000; border: none; box-shadow: 0 6px 15px rgba(247, 151, 30, 0.4); transform: translateY(-2px);` 
                : `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: rgba(255,193,7,0.05); color: #f7971e; border: 1px solid rgba(255,193,7,0.4);`;
        } else if (cat.startsWith('เซ็ต')) {
            inlineStyle = isActive 
                ? `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, #654ea3, #eaafc8); color: #fff; border: none; box-shadow: 0 6px 15px rgba(101, 78, 163, 0.4); transform: translateY(-2px);` 
                : `padding: 8px 20px; border-radius: 30px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease; background: rgba(138,43,226,0.05); color: #eaafc8; border: 1px solid rgba(138,43,226,0.4);`;
        } else {
             inlineStyle += isActive 
                ? `background: linear-gradient(135deg, #444, #222) !important; color: #fff !important; border: 1px solid #555 !important; box-shadow: 0 6px 15px rgba(0,0,0,0.5) !important; transform: translateY(-2px) !important;` 
                : ``;
        }
        
        html += `<button onclick="filterItems('${cat}')" style="${inlineStyle}">${cat}</button>`; 
    });
    
    html += `<button class="${currentCategory === 'ป้ายเหลือง' ? 'active' : ''}" onclick="filterItems('ป้ายเหลือง')" style="${baseBtnStyle} ${currentCategory === 'ป้ายเหลือง' ? 'background: linear-gradient(135deg, #ff9800, #ffb74d); color: #000; border: none; box-shadow: 0 6px 15px rgba(255, 152, 0, 0.4); transform: translateY(-2px);' : 'color: #ff9800; border: 1px solid rgba(255,152,0,0.4);'}"><i class="fas fa-exclamation-triangle" style="margin-right:5px;"></i> ป้ายเหลือง</button>`;
    
    filterContainer.innerHTML = html;
}

window.filterItems = (cat) => { 
    currentCategory = cat; 
    window.renderCategories();
    window.renderItems(cat); 
}

window.renderItems = (cat = currentCategory) => { 
    currentCategory = cat; 
    const grid = document.getElementById('itemGrid'); if(!grid) return; 
    
    if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #888;"><i class="fas fa-spinner fa-spin fa-2x" style="margin-bottom: 15px;"></i><br>กำลังโหลดข้อมูลอุปกรณ์...</div>';
        return;
    }

    let htmlOut = '';

    let sortedItems = [...items].sort((a, b) => {
        const catA = getDisplayCategory(a.category);
        const catB = getDisplayCategory(b.category);
        const getWeight = (item, cat) => {
            if (item.isYellowTag) return 3; 
            if (cat.startsWith('เซ็ต')) return 2; 
            return 1; 
        };
        const wA = getWeight(a, catA);
        const wB = getWeight(b, catB);
        
        if (wA !== wB) return wA - wB;
        if (catA !== catB) return catA.localeCompare(catB, 'th');
        return a.name.localeCompare(b.name, 'th');
    });
    
    sortedItems.forEach(item => {
        const itemDisplayCat = getDisplayCategory(item.category);
        const isYellow = item.isYellowTag === true;
        
        if (currentCategory === 'ป้ายเหลือง' && !isYellow) return; 
        if (currentCategory !== 'all' && currentCategory !== 'ป้ายเหลือง' && itemDisplayCat !== currentCategory) return; 
        
        let totalStock = item.stock !== undefined && item.stock !== "" ? parseInt(item.stock) : 1; 
        let borrowedQty = 0;
        
        borrowRequests.forEach(req => {
            if (['pending', 'approved_pickup', 'borrowed', 'pending_return'].includes(req.status)) {
                let reqItemStr = String(req.item || ""); 
                let regex = /([^,]+)\s*\((\d+)\s*ชิ้น\)/g; 
                let match; let foundFormat = false;
                
                while ((match = regex.exec(reqItemStr)) !== null) { 
                    foundFormat = true; 
                    if (match[1].trim() === item.name) borrowedQty += parseInt(match[2]); 
                }
                if (!foundFormat && reqItemStr) {
                    reqItemStr.split(',').forEach(it => { if (it.trim() === item.name) borrowedQty += 1; });
                }
            }
        });
        
        let remainStock = totalStock - borrowedQty; 
        let cartItem = cart.find(c => c.id === item.id);
        let cartQty = cartItem ? cartItem.qty : 0;
        let finalAvailable = remainStock - cartQty; 

        let statusCSS = 'available', btnClass = 'btn-borrow', btnText = '<i class="fas fa-cart-plus"></i> จอง';
        let btnAction = `addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${remainStock})`;
        let badgeText = remainStock > 0 ? `ว่าง (${remainStock})` : 'หมด';

        if (item.condition === 'damaged') { 
            statusCSS = 'borrowed'; btnClass = 'btn-disabled'; btnAction = ''; btnText = '<i class="fas fa-wrench"></i> ชำรุด'; badgeText = 'ซ่อม'; 
        } else if (remainStock <= 0) {
            statusCSS = 'borrowed'; btnClass = 'btn-disabled'; btnAction = ''; btnText = '<i class="fas fa-ban"></i> ไม่ว่าง'; badgeText = 'ถูกยืมหมด';
        } else if (cartItem) { 
            statusCSS = 'incart'; btnText = `เลือกแล้ว (${cartItem.qty})`; badgeText = 'ตะกร้า'; 
            if (finalAvailable <= 0) { btnClass = 'btn-disabled'; btnAction = ''; btnText = 'สิทธิ์เต็ม'; }
        }
        
        let yellowWarning = isYellow ? `<div style="font-size:11px; color:#ff9800; text-align:center; margin-top:5px; background:rgba(255,152,0,0.1); padding:3px; border-radius:4px;"><i class="fas fa-exclamation-triangle"></i> ใช้ในมอเท่านั้น</div>` : '';
        
        let tagStyle = isYellow ? 'background:#ff9800; color:#000;' : '';
        if (itemDisplayCat === 'เซ็ตแดง') tagStyle = 'background:#dc3545; color:#fff;';
        else if (itemDisplayCat === 'เซ็ตเขียว') tagStyle = 'background:#28a745; color:#fff;';
        else if (itemDisplayCat === 'เซ็ตเหลือง') tagStyle = 'background:#ffc107; color:#000;';

        htmlOut += `<div class="card"><div class="card-img" onclick="window.openItemDetail('${item.id}')" style="cursor:pointer;"><img src="${item.image}"><div class="status-badge ${statusCSS}">${badgeText}</div></div><div class="card-body"><h4>${item.name}</h4><span class="category-tag" style="${tagStyle}">${itemDisplayCat.toUpperCase()}</span>${yellowWarning}<div style="display:flex; gap:5px; margin-top:auto;"><button onclick="window.openItemDetail('${item.id}')" style="flex:1; padding:10px; border-radius:6px; background:#444; color:white; border:none; cursor:pointer;"><i class="fas fa-info-circle"></i></button><button class="${btnClass}" onclick="${btnAction}" style="flex:3; margin-top:0;">${btnText}</button></div></div></div>`;
    });
    
    grid.innerHTML = htmlOut || '<div style="grid-column: 1 / -1; text-align: center; color: #888;">ไม่พบอุปกรณ์ในหมวดหมู่นี้</div>';
}

window.openItemDetail = function(id) {
    const item = items.find(i => i.id === id); if (!item) return;
    const diff = item.difficulty || "ระดับปานกลาง (Medium)";
    const desc = item.description || "ยังไม่มีข้อมูลเพิ่มเติม...";
    const ref = item.reference || "อ้างอิงข้อมูลพื้นฐาน";
    const itemDisplayCat = getDisplayCategory(item.category);
    const isYellow = item.isYellowTag === true;
    
    let totalStock = item.stock !== undefined && item.stock !== "" ? parseInt(item.stock) : 1; 
    let borrowedQty = 0;
    borrowRequests.forEach(req => {
        if (['pending', 'approved_pickup', 'borrowed', 'pending_return'].includes(req.status)) {
            let reqItemStr = String(req.item || ""); 
            let regex = /([^,]+)\s*\((\d+)\s*ชิ้น\)/g; let match; let foundFormat = false;
            while ((match = regex.exec(reqItemStr)) !== null) { 
                foundFormat = true; if (match[1].trim() === item.name) borrowedQty += parseInt(match[2]); 
            }
            if (!foundFormat && reqItemStr) {
                reqItemStr.split(',').forEach(it => { if (it.trim() === item.name) borrowedQty += 1; });
            }
        }
    });
    let remainStock = totalStock - borrowedQty;
    
    let safeName = item.name.replace(/'/g, "\\'");
    let btn = (item.condition === 'damaged' || remainStock <= 0) 
        ? `<button class="btn-disabled" style="width:100%; padding:12px; border-radius:8px;"><i class="fas fa-ban"></i> ไม่พร้อม (ของหมด/ชำรุด)</button>` 
        : `<button class="btn-borrow" onclick="addToCart(\'${item.id}\', \'${safeName}\', ${remainStock}); window.closeItemDetail();" style="width:100%; padding:12px; border-radius:8px; background:var(--theme-primary);"><i class="fas fa-cart-plus"></i> เพิ่มลงตะกร้า (เหลือ ${remainStock})</button>` ;
        
    let damageHtml = '';
    if (item.condition === 'damaged' && item.damageReason) {
        damageHtml = `<div style="margin-top: 8px; padding: 10px; background: rgba(220, 53, 69, 0.15); border-left: 4px solid #dc3545; font-size: 13px; color: #ffcccc; border-radius: 0 4px 4px 0;"><b><i class="fas fa-wrench"></i> อาการชำรุด:</b> ${item.damageReason}</div>`; 
    }

    let yellowAlert = isYellow
        ? `<div style="margin-top: 8px; padding: 10px; background: rgba(255, 152, 0, 0.15); border-left: 4px solid #ff9800; font-size: 13px; color: #ffcc80; border-radius: 0 4px 4px 0;"><b><i class="fas fa-exclamation-triangle"></i> กฎการยืม:</b> อุปกรณ์ป้ายเหลือง ไม่อนุญาตให้นำไปใช้นอกสถานที่ (ใช้เฉพาะในมหาวิทยาลัยเท่านั้น)</div>` 
        : '';
        
    let tagStyle = isYellow ? 'background:#ff9800; color:#000;' : '#333;';
    if (itemDisplayCat === 'เซ็ตแดง') tagStyle = 'background:#dc3545; color:#fff;';
    else if (itemDisplayCat === 'เซ็ตเขียว') tagStyle = 'background:#28a745; color:#fff;';
    else if (itemDisplayCat === 'เซ็ตเหลือง') tagStyle = 'background:#ffc107; color:#000;';

    document.getElementById('itemDetailBody').innerHTML = `
        <div style="display:flex; flex-direction:column; background:#1a1a1a;">
            <div style="height: 250px; background: #000; display:flex; justify-content:center; align-items:center;"><img src="${item.image}" style="max-width:100%; max-height:100%; object-fit:contain;"></div>
            <div style="padding: 20px;">
                <span class="category-tag" style="${tagStyle}">${itemDisplayCat.toUpperCase()}</span>
                <h2 style="margin: 5px 0 15px; color:var(--theme-primary);">${item.name}</h2>
                <div style="background: #111; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333; font-size: 14px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: ${(damageHtml || yellowAlert) ? '10px' : '0'}; ${(damageHtml || yellowAlert) ? '' : 'border-bottom: 1px dashed #444; padding-bottom: 10px;'}">
                        <span style="color:#aaa;">สภาพ:</span>
                        <strong style="color:${item.condition === 'damaged' ? 'var(--danger)' : 'var(--success)'}">${item.condition === 'damaged' ? 'ชำรุด / ส่งซ่อม' : 'ใช้งานได้ปกติ'}</strong>
                    </div>
                    ${damageHtml}
                    ${yellowAlert}
                    <div style="display:flex; justify-content:space-between; margin-top: 10px; border-top: ${(damageHtml || yellowAlert) ? '1px dashed #444' : 'none'}; padding-top: ${(damageHtml || yellowAlert) ? '10px' : '0'};">
                        <span style="color:#aaa;">ระดับใช้งาน:</span><strong style="color:var(--warning);">${diff}</strong>
                    </div>
                </div>
                <div style="margin-bottom: 15px;"><h4 style="color:#fff; margin-bottom:8px;">รายละเอียด:</h4><p style="color:#bbb; font-size:13px; margin:0; background:#000; padding:15px; border-radius:8px; white-space: pre-wrap;">${desc}</p></div>
                <div style="margin-bottom: 20px; font-size: 11px; color: #888; text-align: right;">อ้างอิง: <em>${ref}</em></div>
                ${btn}
            </div>
        </div>`;
    document.getElementById('itemDetailModal').style.display = 'flex';
}

window.closeItemDetail = () => document.getElementById('itemDetailModal').style.display = 'none';

window.addToCart = async function(id, name, stock) {
    const totalStock = parseInt(stock) || 0;
    if (totalStock <= 0) { Swal.fire({ icon: 'error', title: 'ของหมด!', text: 'อุปกรณ์ชิ้นนี้ไม่มีในสต็อกพร้อมให้ยืม', background: '#1a1a1a', color: '#fff' }); return; }

    const existingItem = cart.find(item => item.id === id);
    const currentCartQty = existingItem ? existingItem.qty : 0;
    const availableToBorrow = totalStock - currentCartQty;

    if (availableToBorrow <= 0) { Swal.fire({ icon: 'error', title: 'สิทธิ์เต็ม!', text: 'คุณเพิ่มอุปกรณ์นี้ลงตะกร้าครบตามจำนวนสต็อกแล้ว', background: '#1a1a1a', color: '#fff' }); return; }

    // 🟢 5. เปลี่ยน Swal Popup แจ้งเตือนให้เข้ากับธีม Dark Mode
    const { value: qty } = await Swal.fire({
        title: '<span style="color:#ff9800;"><i class="fas fa-shopping-basket"></i> ระบุจำนวนยืม</span>',
        html: `<div style="margin-bottom:15px; font-size:16px; font-weight:bold; color:#fff;">${name}</div>
               <div style="background: rgba(255,152,0,0.1); border: 1px solid rgba(255,152,0,0.3); padding: 10px; border-radius: 8px; color: #ffb74d; font-size: 13px;">
                   <i class="fas fa-box-open"></i> จำนวนคงเหลือในคลัง: <b>${availableToBorrow}</b> ชิ้น
               </div>`,
        input: 'number',
        inputValue: 1,
        inputAttributes: { 
            min: 1, 
            max: availableToBorrow,
            style: 'background: #111; color: #fff; border: 1px solid #555; border-radius: 8px; padding: 10px; text-align: center; font-size: 18px; width: 60%; margin: 15px auto;' 
        },
        background: '#1a1a1a',
        color: '#fff',
        showCancelButton: true, 
        confirmButtonText: '<i class="fas fa-check"></i> ตกลง', 
        cancelButtonText: 'ยกเลิก',
        buttonsStyling: false,
        customClass: {
            popup: 'swal-popup-dark',
            confirmButton: 'swal-btn-confirm',
            cancelButton: 'swal-btn-cancel',
            actions: 'swal-actions-gap'
        }
    });

    if (qty) {
        const borrowQty = parseInt(qty);
        if (borrowQty > availableToBorrow) { Swal.fire({ icon: 'warning', title: 'เกินจำนวนสต็อก!', text: `ยืมเพิ่มได้สูงสุด ${availableToBorrow} ชิ้นเท่านั้น`, background: '#1a1a1a', color: '#fff' }); return; }
        if (borrowQty > 0) {
            if (existingItem) { existingItem.qty += borrowQty; } else { cart.push({ id, name, qty: borrowQty }); }
            window.updateCartCount(); window.renderItems();
            Swal.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, background: '#1a1a1a', color: '#fff' });
        }
    }
}

window.updateCartCount = () => { const b = document.getElementById('cartCountBadge'); if(b) b.innerText = cart.reduce((s, i) => s + i.qty, 0); }

window.openCartModal = () => {
    if(cart.length === 0) return Swal.fire({title: 'ตะกร้าว่าง', icon: 'info', background: '#1a1a1a', color: '#fff'});
    document.getElementById('cartBorrowerName').value = currentUser.name || currentUser.username;
    const termsBox = document.getElementById('cartTerms'); if (termsBox) termsBox.checked = false;
    const dInput = document.getElementById('cartBorrowDate'); 
    const rInput = document.getElementById('cartReturnDate');
    const tInput = document.getElementById('cartReturnTime'); 
    
    if(dInput && rInput) { 
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; 
        
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 15);
        const maxStr = maxDate.toISOString().split('T')[0];

        dInput.min = todayStr; 
        dInput.max = maxStr; 
        dInput.value = ""; 
        rInput.min = todayStr; 
        rInput.value = ""; 
        if(tInput) tInput.value = ""; 
        
        dInput.onchange = () => { 
            rInput.min = dInput.value; 
            if (rInput.value && rInput.value < dInput.value) rInput.value = dInput.value; 
        };
    }
    
    let hasGroupSet = false;
    cart.forEach(c => {
        let itemObj = items.find(i => i.id === c.id);
        if(itemObj && (itemObj.category === 'เซ็ตแดง' || itemObj.category === 'เซ็ตเขียว' || itemObj.category === 'เซ็ตเหลือง')) {
            hasGroupSet = true;
        }
    });
    
    const groupContainer = document.getElementById('cartGroupMembersContainer');
    if(groupContainer) {
        groupContainer.style.display = hasGroupSet ? 'block' : 'none';
        document.getElementById('cartGroupMembers').value = '';
    }
    
    document.getElementById('cartItemsList').innerHTML = cart.map((i, idx) => `<div style="display:flex; justify-content:space-between; color:white; padding:8px 0; border-bottom:1px solid #444;"><span>${idx+1}. ${i.name} (x${i.qty})</span><button type="button" onclick="removeFromCart('${i.id}')" style="background:none; border:none; color:#dc3545; cursor:pointer;"><i class="fas fa-trash"></i></button></div>`).join('');
    document.getElementById('cartModal').style.display = 'flex';
}

window.removeFromCart = (id) => { cart = cart.filter(i => i.id !== id); window.updateCartCount(); window.renderItems(); cart.length === 0 ? window.closeCartModal() : window.openCartModal(); }
window.closeCartModal = () => document.getElementById('cartModal').style.display = 'none';

window.openHistoryModal = () => {
    const tbody = document.getElementById('historyTableBody'); if(!tbody) return; tbody.innerHTML = '';
    const myReqs = borrowRequests.filter(r => r.user === (currentUser.name||currentUser.username)).sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0));
    
    if (myReqs.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">ไม่มีประวัติการจอง</td></tr>'; }
    else myReqs.forEach(r => {
        let st='', btn=''; 
        if(r.status === 'pending') st='<span style="color:#ffc107">⏳ รออนุมัติ</span>';
        else if(r.status === 'approved_pickup') { st='<span style="color:#0dcaf0">📦 ดำเนินการ</span>'; btn=`<button onclick="triggerPickup('${r.id}')" class="btn-confirm" style="padding:5px; font-size:12px;">📷 รับของ</button>`; }
        else if(r.status === 'borrowed') { st='<span style="color:#198754">✅ กำลังยืม</span>'; btn=`<div style="display:flex; gap:5px; justify-content:center;"><button onclick="viewPhoto('${r.id}', 'pickup')" style="background:none; border:none; color:#0dcaf0; font-size:12px; cursor:pointer; padding:0;">รูปรับ</button> <button onclick="triggerReturn('${r.id}')" class="btn-confirm" style="padding:5px; font-size:12px; background:#ff9800; margin:0;">📷 ส่งคืน</button></div>`; }
        else if(r.status === 'pending_return') { st='<span style="color:#ff9800">🔄 รอตรวจ</span>'; btn=`<button onclick="viewPhoto('${r.id}', 'return')" style="background:none; border:none; color:#ff9800; font-size:12px; cursor:pointer;">ดูรูปคืน</button>`; }
        else if(r.status === 'returned') { st='<span style="color:#aaa">↩️ คืนแล้ว</span>'; btn=`<div style="display:flex; gap:5px; justify-content:center;"><button onclick="viewPhoto('${r.id}', 'pickup')" style="background:none; border:none; color:#0dcaf0; font-size:12px; cursor:pointer; padding:0;">รูปรับ</button> <button onclick="viewPhoto('${r.id}', 'return')" style="background:none; border:none; color:#ff9800; font-size:12px; cursor:pointer; padding:0;">รูปคืน</button></div>`; }
        else st='<span style="color:red">❌ ปฏิเสธ</span>';
        
        let printBtn = '';
        if (r.status !== 'rejected') { printBtn = `<button onclick="printReceipt('${r.id}')" style="background:#0dcaf0; color:#000; border:none; padding:5px 8px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer; width:100%; margin-top:3px;"><i class="fas fa-print"></i> พิมพ์ใบยืม</button>`; }

        let retStr = r.returnDate ? `${r.returnDate} ${r.returnTimeLimit ? 'เวลา ' + r.returnTimeLimit + ' น.' : ''}` : '-';
        let remarkHtml = r.returnRemarks ? `<div style="margin-top: 5px; font-size: 11px; color: #ff9800; background: rgba(255,152,0,0.1); padding: 5px; border-radius: 4px; border-left: 3px solid #ff9800; text-align: left;"><b>📝 หมายเหตุแอดมิน:</b> ${r.returnRemarks}</div>` : '';
        let dateHtml = `รับ: ${r.date}<br><span style="color:var(--warning); font-size:12px;">คืน: ${retStr}</span>${remarkHtml}`;
        let actionHtml = `<div style="display:flex; flex-direction:column; gap:5px; align-items:center;">${btn}${printBtn}</div>`;
        if(!btn && !printBtn) actionHtml = '-';
        
        let formattedItems = formatEquipList(r.item);

        tbody.innerHTML += `<tr><td style="padding:15px;">${formattedItems}</td><td style="padding:15px;">${dateHtml}</td><td style="padding:15px;">${st}</td><td style="padding:15px;">${actionHtml}</td></tr>`;
    });
    document.getElementById('historyModal').style.display = 'flex';
}
window.closeHistoryModal = () => document.getElementById('historyModal').style.display = 'none';

window.searchItem = (t) => { Array.from(document.getElementsByClassName('card')).forEach(c => c.style.display = c.querySelector('h4').innerText.toLowerCase().includes(t.toLowerCase()) ? 'flex' : 'none'); }
window.triggerPickup = (id) => { currentPickupId = id; document.getElementById('pickupProofInput').click(); }
window.triggerReturn = (id) => { currentReturnId = id; document.getElementById('returnProofInput').click(); }

window.switchTab = (t) => { 
    document.querySelectorAll('.content-section').forEach(e => e.style.display = 'none'); 
    document.querySelectorAll('.sidebar-menu a').forEach(e => e.classList.remove('active')); 
    document.getElementById(`section-${t}`).style.display = 'block'; 
    document.getElementById(`menu-${t}`).classList.add('active'); 
    if (t === 'stats') { window.renderStats(); }
}

window.searchRequest = (query) => { searchQuery = query.toLowerCase(); currentPage = 1; window.renderRequests(); }

window.openReturnInspectionModal = async function(reqId) {
    const req = borrowRequests.find(r => r.id === reqId);
    if (!req) return;

    let reqItemStr = String(req.item || "");
    let regex = /([^,]+)\s*\((\d+)\s*ชิ้น\)/g;
    let parsedItems = [];
    let match;
    while ((match = regex.exec(reqItemStr)) !== null) {
        parsedItems.push({ name: match[1].trim(), qty: parseInt(match[2]) });
    }
    if (parsedItems.length === 0 && reqItemStr) {
        reqItemStr.split(',').forEach(it => parsedItems.push({ name: it.trim(), qty: 1 }));
    }

    let itemsHtml = parsedItems.map((item, index) => `
        <div style="background: #222; padding: 15px; border-radius: 8px; border: 1px solid #444; width: 100%; box-sizing: border-box;">
            <div style="color: var(--theme-primary); font-weight: bold; margin-bottom: 12px; font-size: 15px; white-space: normal;">
                ${index + 1}. ${item.name} <span style="color:#aaa; font-size:13px;">(จำนวน ${item.qty} ชิ้น)</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
                <label style="cursor: pointer; display: flex; align-items: center; gap: 10px; background: rgba(40,167,69,0.1); padding: 8px; border-radius: 6px;">
                    <input type="radio" name="insp_cond_${index}" value="good" checked style="width:16px; height:16px; accent-color: #28a745; margin:0;">
                    <span style="color: #28a745; font-weight: 600;">✅ สภาพปกติสมบูรณ์</span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center; gap: 10px; background: rgba(255,193,7,0.1); padding: 8px; border-radius: 6px;">
                    <input type="radio" name="insp_cond_${index}" value="minor" style="width:16px; height:16px; accent-color: #ffc107; margin:0;">
                    <span style="color: #ffc107; font-weight: 600;">⚠️ มีตำหนิเล็กน้อย <small>(ใช้งานต่อได้ / ไม่ต้องส่งซ่อม)</small></span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center; gap: 10px; background: rgba(220,53,69,0.1); padding: 8px; border-radius: 6px;">
                    <input type="radio" name="insp_cond_${index}" value="damaged" style="width:16px; height:16px; accent-color: #dc3545; margin:0;">
                    <span style="color: #dc3545; font-weight: 600;">❌ ชำรุด <small>(ระบบจะล็อคสถานะเป็น "ส่งซ่อม" อัตโนมัติ)</small></span>
                </label>
            </div>
        </div>
    `).join('');

    const { value: formValues } = await Swal.fire({
        title: '📋 ตรวจสอบสภาพก่อนรับคืน',
        html: `
            <div style="text-align: left;">
                <p style="color: #aaa; font-size: 14px; margin-bottom: 15px;">ผู้ยืม: <b style="color:#fff;">${req.user}</b></p>
                <div style="max-height: 280px; overflow-y: auto; overflow-x: hidden; margin-bottom: 15px; padding-right: 5px; display: flex; flex-direction: column; gap: 10px;">
                    ${itemsHtml}
                </div>
                <label style="color:#aaa; display:block; margin-bottom:5px; font-size:14px;">📝 ระบุรายละเอียดตำหนิ/ความเสียหาย (ถ้ามี)</label>
                <textarea id="insp-remarks" class="premium-input" placeholder="เช่น รอยขีดข่วนบริเวณหน้าเลนส์, ขาตั้งน็อตหลวม..." style="height: 80px;"></textarea>
            </div>
        `,
        width: 600,
        background: '#1a1a1a',
        color: '#fff',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-check-circle"></i> บันทึก & รับคืนเข้าคลัง',
        confirmButtonColor: '#28a745',
        cancelButtonText: 'ยกเลิก',
        preConfirm: () => {
            let inspectionResults = [];
            let hasDamaged = false;
            let hasMinor = false;
            parsedItems.forEach((item, index) => {
                let radios = document.getElementsByName(`insp_cond_${index}`);
                let cond = 'good';
                for(let r of radios) { if(r.checked) cond = r.value; }
                
                if(cond === 'damaged') hasDamaged = true;
                if(cond === 'minor') hasMinor = true;
                
                inspectionResults.push({ name: item.name, qty: item.qty, condition: cond });
            });
            let remarks = document.getElementById('insp-remarks').value.trim();
            return { inspectionResults, remarks, hasDamaged, hasMinor };
        }
    });

    if (formValues) {
        Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff'});
        try {
            let adminName = currentUser.name || currentUser.username;
            let lineMsgText = "📥 แอดมินตรวจรับคืนอุปกรณ์เรียบร้อย";

            if (formValues.hasDamaged) {
                lineMsgText += `\n🚨 พบอุปกรณ์ชำรุด/ส่งซ่อม!`;
            } else if (formValues.hasMinor) {
                lineMsgText += `\n⚠️ พบอุปกรณ์มีตำหนิเล็กน้อย`;
            }

            if (formValues.remarks) {
                lineMsgText += `\n📝 หมายเหตุ: ${formValues.remarks}`;
            }

            await updateDoc(doc(db, "requests", reqId), {
                status: 'returned',
                returnRemarks: formValues.remarks,
                inspectionDetails: formValues.inspectionResults,
                inspectedBy: adminName,
                inspectedAt: new Date()
            });

            if (formValues.hasDamaged) {
                for (let res of formValues.inspectionResults) {
                    if (res.condition === 'damaged') {
                        let realItem = items.find(i => i.name === res.name);
                        if (realItem) {
                            await updateDoc(doc(db, "items", realItem.id), {
                                condition: 'damaged',
                                damageReason: `[ชำรุดจากการยืมของ ${req.user}] ${formValues.remarks}`
                            });
                        }
                    }
                }
            }

            fetch(LINE_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ 
                    action: "update_status", 
                    borrowerName: req.user, 
                    equipmentName: req.item,
                    statusText: lineMsgText,
                    adminName: adminName 
                })
            }).catch(e => console.error(e));

            Swal.fire({ icon: 'success', title: 'รับคืนสำเร็จ!', text: 'บันทึกประวัติการตรวจเรียบร้อย', timer: 2500, background: '#1a1a1a', color: '#fff', showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message, background: '#1a1a1a', color: '#fff' });
        }
    }
}

window.renderRequests = () => {
    const tbody = document.getElementById('requestTableBody'); if(!tbody) return; 
    let reqs = [...borrowRequests].sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0));
    if(searchQuery) reqs = reqs.filter(r => (r.user && r.user.toLowerCase().includes(searchQuery)) || (r.item && r.item.toLowerCase().includes(searchQuery)));
    
    const pages = Math.ceil(reqs.length / itemsPerPage) || 1; if(currentPage > pages) currentPage = pages; 
    const pagedReqs = reqs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (pagedReqs.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">ไม่พบข้อมูล</td></tr>`; return; }
    
    let htmlOut = '';
    pagedReqs.forEach(r => {
        let photoDisplay = `<div style="display:flex; gap:5px;">${r.proofPhoto ? `<button onclick="viewPhoto('${r.id}', 'pickup')" style="background:none; border:none; color:#0dcaf0; cursor:pointer;">📷 รับ</button>` : ''}${r.returnProofPhoto ? `<button onclick="viewPhoto('${r.id}', 'return')" style="background:none; border:none; color:#ff9800; cursor:pointer;">📷 คืน</button>` : ''}</div>`;
        if(!r.proofPhoto && !r.returnProofPhoto) photoDisplay = '-';
        
        let badge = '', btns = '';
        if(r.status === 'pending') { 
            badge = '<span class="badge" style="background:transparent; color:#ffc107; border:1px solid #ffc107;">ใหม่</span>'; 
            btns = `<button onclick="updateStatus('${r.id}','approved_pickup')" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; margin-right:5px;">อนุญาต</button> 
                    <button onclick="updateStatus('${r.id}','rejected')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">ปฏิเสธ</button>`; 
        } else if (r.status === 'approved_pickup') { 
            badge = '<span class="badge" style="background:#0dcaf0; color:black;">ดำเนินการ</span>'; 
            btns = `<button onclick="updateStatus('${r.id}','pending')" style="background:#ffc107; color:#000; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;"><i class="fas fa-undo"></i> ยกเลิก</button>`; 
        } else if(r.status === 'borrowed') { 
            badge = '<span class="badge" style="background:#198754; color:white;">ถูกยืม</span>'; 
            btns = `<button onclick="openReturnInspectionModal('${r.id}')" style="background:#6c757d; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;"><i class="fas fa-clipboard-check"></i> รับคืน(ข้ามรูป)</button>`; 
        } else if (r.status === 'pending_return') { 
            badge = '<span class="badge" style="background:#ff9800; color:#fff;">รอตรวจคืน</span>'; 
            btns = `<button onclick="openReturnInspectionModal('${r.id}')" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; margin-right:5px;"><i class="fas fa-clipboard-check"></i> ตรวจรับคืน</button> 
                    <button onclick="updateStatus('${r.id}','borrowed')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">ตีกลับ</button>`; 
        } else { 
            let statusText = r.status === 'returned' ? 'คืนแล้ว' : 'ปฏิเสธ'; let statusColor = r.status === 'returned' ? '#6c757d' : '#dc3545';
            badge = `<span class="badge" style="background:#333; color:${statusColor};">${statusText}</span>`; 
            btns = `<button onclick="deleteRequest('${r.id}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;"><i class="fas fa-trash"></i> ลบ</button>`; 
        }
        
        let printBtn = `<button onclick="printReceipt('${r.id}')" style="background:#0dcaf0; color:#000; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; margin-top:5px; width:100%;"><i class="fas fa-print"></i> พิมพ์ใบยืม</button>`;
        let retStr = r.returnDate ? `${r.returnDate} ${r.returnTimeLimit ? 'เวลา ' + r.returnTimeLimit + ' น.' : ''}` : '-';
        
        let adminRemarkHtml = r.returnRemarks ? `<div style="margin-top: 8px; font-size: 12px; color: #ff9800; background: rgba(255,152,0,0.15); padding: 8px 10px; border-radius: 6px; border-left: 4px solid #ff9800; word-break: break-word; white-space: pre-wrap; display: block; max-width: 100%; box-sizing: border-box; line-height: 1.5; text-align: left;"><b>📝 หมายเหตุ:</b> ${r.returnRemarks}</div>` : '';
        let dateHtml = `รับ: ${r.date}<br><span style="color:var(--warning); font-size:12px;">คืน: ${retStr}</span>${adminRemarkHtml}`;
        
        if (r.status === 'borrowed' && r.returnDate) {
            const today = new Date().toISOString().split('T')[0];
            if (r.returnDate < today) dateHtml += `<br><span class="overdue-alert"><i class="fas fa-exclamation-triangle"></i> เลยกำหนดคืน!</span>`;
        }
        
        let formattedItems = formatEquipList(r.item);

        htmlOut += `<tr><td>${r.user}</td><td>${formattedItems}</td><td>${dateHtml}</td><td>${badge}</td><td>${photoDisplay}</td><td><div style="display:flex; flex-direction:column; gap:5px;">${btns}${printBtn}</div></td></tr>`;
    });
    tbody.innerHTML = htmlOut;
    if(window.renderPagination) window.renderPagination(reqs.length, pages);
}

window.printReceipt = (id) => {
    const r = borrowRequests.find(req => req.id === id); if(!r) return;
    let retStr = r.returnDate ? `${r.returnDate} ${r.returnTimeLimit ? 'เวลา ' + r.returnTimeLimit + ' น.' : ''}` : '-';
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const html = `<html><head><title>ใบยืมอุปกรณ์ - MMD BORROW</title><style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600&display=swap');body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #000; line-height: 1.6; }.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }.header h2 { margin: 0; font-size: 24px; }.content { font-size: 16px; }.table { width: 100%; border-collapse: collapse; margin-top: 20px; }.table th, .table td { border: 1px solid #000; padding: 12px; text-align: left; }.table th { background-color: #f2f2f2; }.footer { margin-top: 60px; display: flex; justify-content: space-between; }.sign-box { text-align: center; width: 45%; }</style></head><body><div class="header"><h2>เอกสารการยืม-คืนอุปกรณ์การศึกษา</h2><p style="margin: 5px 0;">สาขามัลติมีเดีย (MMD) - มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตสุรินทร์</p></div><div class="content"><p><strong>รหัสทำรายการ (ID):</strong> ${r.id}</p><p><strong>ชื่อผู้ยืม:</strong> ${r.user}</p><p><strong>เหตุผลการยืม:</strong> ${r.reason || '-'}</p><table class="table"><thead><tr><th>รายการอุปกรณ์ที่ยืม</th><th style="width: 150px;">วันที่รับของ</th><th style="width: 180px;">วันที่/เวลา กำหนดคืน</th></tr></thead><tbody><tr><td>${r.item}</td><td>${r.date}</td><td>${retStr}</td></tr></tbody></table><p style="margin-top: 25px; font-size:14px; color:#555;"><i>* ข้าพเจ้ายอมรับว่าจะดูแลรักษาอุปกรณ์เป็นอย่างดี หากเกิดความเสียหาย ชำรุด หรือสูญหาย ข้าพเจ้ายินดีรับผิดชอบและชดใช้ตามมูลค่าจริงทุกประการ</i></p></div><div class="footer"><div class="sign-box"><p>ลงชื่อ..........................................................ผู้ยืม</p><p>(${r.user})</p><p>วันที่รับของ: _____/_____/_____</p></div><div class="sign-box"><p>ลงชื่อ..........................................................ผู้อนุมัติ/จ่ายของ</p><p>(..........................................................)</p><p>วันที่: _____/_____/_____</p></div></div><script>window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); } };</script></body></html>`;
    printWindow.document.write(html); printWindow.document.close();
}

window.renderPagination = (total, pages) => {
    const c = document.getElementById('paginationControls'); if(!c) return; if (total <= itemsPerPage) { c.innerHTML = ''; return; }
    let h = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    for (let i=1; i<=pages; i++) h += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    h += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === pages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`; c.innerHTML = h;
}
window.changePage = (p) => { currentPage = p; window.renderRequests(); }

window.updateStatus = async (id, s) => { 
    await updateDoc(doc(db, "requests", id), { status: s }); 
    
    const req = borrowRequests.find(r => r.id === id);
    if (req) {
        let statusThai = "";
        if (s === 'approved_pickup') statusThai = "✅ อนุมัติแล้ว (สามารถมารับของได้)";
        else if (s === 'rejected') statusThai = "❌ ไม่อนุมัติ (ปฏิเสธการให้ยืม)";
        else if (s === 'returned') statusThai = "📥 แอดมินรับคืนอุปกรณ์เรียบร้อย";
        else if (s === 'borrowed') statusThai = "⚠️ ตีกลับ (ให้ตรวจสอบ/ส่งรูปคืนใหม่)";
        else if (s === 'pending') statusThai = "⏳ ยกเลิกการอนุมัติ (กลับไปรอตรวจสอบใหม่)";
        else statusThai = s;

        fetch(LINE_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ 
                action: "update_status", 
                borrowerName: req.user, 
                equipmentName: req.item,
                statusText: statusThai,
                adminName: currentUser.name || currentUser.username 
            })
        }).catch(e => console.error(e));
    }
}

window.deleteRequest = async (id) => { if((await Swal.fire({title:'ลบ?',icon:'warning',showCancelButton:true, background: '#1a1a1a', color: '#fff'})).isConfirmed) { await deleteDoc(doc(db, "requests", id)); Swal.fire({title:'ลบแล้ว',icon:'success', background: '#1a1a1a', color: '#fff'}); } }

window.filterAdminInventory = (cat) => {
    adminCurrentCategory = cat;
    window.renderInventory();
}

window.renderInventory = () => { 
    const tbody = document.getElementById('inventoryTableBody'); if(!tbody) return; 

    let filterDiv = document.getElementById('adminInventoryFilters');
    if (!filterDiv) {
        filterDiv = document.createElement('div');
        filterDiv.id = 'adminInventoryFilters';
        filterDiv.className = 'category-scroll';
        filterDiv.style.marginBottom = '15px';
        const table = tbody.parentElement;
        table.parentElement.insertBefore(filterDiv, table);
    }

    const normalizedCats = new Set(items.map(i => getDisplayCategory(i.category)));
    let uniqueCats = [...normalizedCats].filter(c => c && c !== 'ป้ายเหลือง'); 

    let normalCats = uniqueCats.filter(c => !c.startsWith('เซ็ต'));
    let specialCats = uniqueCats.filter(c => c.startsWith('เซ็ต'));
    normalCats.sort((a, b) => a.localeCompare(b, 'th'));
    specialCats.sort((a, b) => a.localeCompare(b, 'th'));
    uniqueCats = [...normalCats, ...specialCats];

    let filterHtml = `<button onclick="filterAdminInventory('all')" style="padding: 6px 14px; font-size: 13px; border-radius: 20px; border: none; cursor: pointer; transition: 0.3s; background: ${adminCurrentCategory === 'all' ? 'var(--theme-primary)' : '#333'}; color: ${adminCurrentCategory === 'all' ? '#000' : '#fff'};">ทั้งหมด</button>`;

    uniqueCats.forEach(cat => { 
        let btnStyle = `padding: 6px 14px; font-size: 13px; border-radius: 20px; border: none; cursor: pointer; transition: 0.3s; background: ${adminCurrentCategory === cat ? 'var(--theme-primary)' : '#333'}; color: ${adminCurrentCategory === cat ? '#000' : '#fff'};`;
        if (cat === 'เซ็ตแดง') btnStyle = `padding: 6px 14px; font-size: 13px; border-radius: 20px; border: 1px solid #dc3545; cursor: pointer; transition: 0.3s; background: ${adminCurrentCategory === cat ? '#dc3545' : '#333'}; color: ${adminCurrentCategory === cat ? '#fff' : '#dc3545'};`;
        else if (cat === 'เซ็ตเขียว') btnStyle = `padding: 6px 14px; font-size: 13px; border-radius: 20px; border: 1px solid #28a745; cursor: pointer; transition: 0.3s; background: ${adminCurrentCategory === cat ? '#28a745' : '#333'}; color: ${adminCurrentCategory === cat ? '#fff' : '#28a745'};`;
        else if (cat === 'เซ็ตเหลือง') btnStyle = `padding: 6px 14px; font-size: 13px; border-radius: 20px; border: 1px solid #ffc107; cursor: pointer; transition: 0.3s; background: ${adminCurrentCategory === cat ? '#ffc107' : '#333'}; color: ${adminCurrentCategory === cat ? '#000' : '#ffc107'};`;
        else if (cat.startsWith('เซ็ต')) btnStyle = `padding: 6px 14px; font-size: 13px; border-radius: 20px; border: 1px solid #8a2be2; cursor: pointer; transition: 0.3s; background: ${adminCurrentCategory === cat ? '#8a2be2' : '#333'}; color: ${adminCurrentCategory === cat ? '#fff' : '#8a2be2'};`;

        filterHtml += `<button onclick="filterAdminInventory('${cat}')" style="${btnStyle}">${cat}</button>`; 
    });

    filterHtml += `<button onclick="filterAdminInventory('ป้ายเหลือง')" style="padding: 6px 14px; font-size: 13px; border-radius: 20px; border: 1px solid #ff9800; cursor: pointer; transition: 0.3s; background: ${adminCurrentCategory === 'ป้ายเหลือง' ? '#ff9800' : '#333'}; color: ${adminCurrentCategory === 'ป้ายเหลือง' ? '#000' : '#ff9800'};"><i class="fas fa-exclamation-triangle"></i> ป้ายเหลือง</button>`;
    
    filterDiv.innerHTML = filterHtml;
    enableDragToScroll(filterDiv); 

    let htmlOut = '';

    let sortedItems = [...items].sort((a, b) => {
        const catA = getDisplayCategory(a.category);
        const catB = getDisplayCategory(b.category);
        const getWeight = (item, cat) => {
            if (item.isYellowTag) return 3; 
            if (cat.startsWith('เซ็ต')) return 2; 
            return 1; 
        };
        const wA = getWeight(a, catA);
        const wB = getWeight(b, catB);
        
        if (wA !== wB) return wA - wB;
        if (catA !== catB) return catA.localeCompare(catB, 'th');
        return a.name.localeCompare(b.name, 'th');
    });
    
    sortedItems.forEach(i => { 
        const itemDisplayCat = getDisplayCategory(i.category);
        const isYellow = i.isYellowTag === true;

        if (adminCurrentCategory === 'ป้ายเหลือง' && !isYellow) return; 
        if (adminCurrentCategory !== 'all' && adminCurrentCategory !== 'ป้ายเหลือง' && itemDisplayCat !== adminCurrentCategory) return;

        let totalStock = i.stock !== undefined && i.stock !== "" ? parseInt(i.stock) : 1;
        let borrowedQty = 0;
        
        borrowRequests.forEach(req => {
            if (['pending', 'approved_pickup', 'borrowed', 'pending_return'].includes(req.status)) {
                let reqItemStr = String(req.item || ""); 
                let regex = /([^,]+)\s*\((\d+)\s*ชิ้น\)/g; let match; let foundFormat = false;
                while ((match = regex.exec(reqItemStr)) !== null) { 
                    foundFormat = true; if (match[1].trim() === i.name) borrowedQty += parseInt(match[2]); 
                }
                if (!foundFormat && reqItemStr) {
                    reqItemStr.split(',').forEach(it => { if (it.trim() === i.name) borrowedQty += 1; });
                }
            }
        });
        let remainStock = totalStock - borrowedQty;

        let st = remainStock > 0 
            ? `<span style="color:var(--success)">ว่าง (${remainStock}/${totalStock})</span>` 
            : `<span style="color:var(--danger)">หมด (0/${totalStock})</span>`;
            
        if (i.condition === 'damaged') st = `<span style="color:#dc3545">ส่งซ่อม</span>`;
        
        let condBtn = i.condition === 'damaged' 
            ? `<button onclick="toggleCondition('${i.id}', 'good')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;">ชำรุด (ส่งซ่อม)</button>` 
            : `<button onclick="toggleCondition('${i.id}', 'damaged')" style="background:#198754; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;">ปกติ (ใช้งานได้)</button>`;
            
        let actionBtns = `<div style="display:flex; gap:5px;"><button onclick="editItem('${i.id}')" style="background:#ffc107; color:#000; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;" title="แก้ไขข้อมูลอุปกรณ์"><i class="fas fa-edit"></i> แก้ไข</button><button onclick="deleteItem('${i.id}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer;" title="ลบอุปกรณ์"><i class="fas fa-trash"></i></button></div>`;
            
        let yellowLabel = i.isYellowTag ? `<br><span style="background:#ff9800; color:#000; font-size:10px; padding:2px 6px; border-radius:10px; font-weight:bold;">ป้ายเหลือง</span>` : '';
        htmlOut += `<tr><td><img src="${i.image}" width="40" style="border-radius:4px;"></td><td style="color:white">${i.name}${yellowLabel}</td><td>${itemDisplayCat}</td><td>${st}</td><td>${condBtn}</td><td>${actionBtns}</td></tr>`; 
    }); 

    tbody.innerHTML = htmlOut || `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#888;">ไม่พบอุปกรณ์ในหมวดหมู่นี้</td></tr>`;
}

window.toggleCondition = async (id, n) => { 
    if (n === 'damaged') {
        const { value: reason } = await Swal.fire({ title: '🛠️ ระบุอาการชำรุด', input: 'textarea', inputLabel: 'สาเหตุที่อุปกรณ์ชำรุด/ส่งซ่อม', inputPlaceholder: 'เช่น เลนส์เป็นรอย, แบตเตอรี่เสื่อม, เปิดไม่ติด...', showCancelButton: true, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#dc3545', confirmButtonText: 'บันทึกอาการ', cancelButtonText: 'ยกเลิก' });
        if (reason !== undefined) { await updateDoc(doc(db, "items", id), { condition: n, damageReason: reason || "ไม่ได้ระบุอาการ" }); Swal.fire({icon: 'success', title: 'บันทึกสถานะชำรุดแล้ว', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false}); }
    } else {
        if((await Swal.fire({title:'เปลี่ยนสภาพกลับเป็น ปกติ?', icon:'question',showCancelButton:true, background:'#1a1a1a', color:'#fff'})).isConfirmed) { await updateDoc(doc(db, "items", id), { condition: n, damageReason: "" }); Swal.fire({icon: 'success', title: 'อัปเดตเป็นปกติแล้ว', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false}); } 
    }
}

window.deleteItem = async (id) => { if((await Swal.fire({title:'ลบ?',icon:'warning',showCancelButton:true, background: '#1a1a1a', color: '#fff'})).isConfirmed) { await deleteDoc(doc(db, "items", id)); } }

window.addNewItem = async () => {
    const presetSets = ['เซ็ตแดง', 'เซ็ตเขียว', 'เซ็ตเหลือง'];
    const uniqueCats = [...new Set([...items.map(i => getDisplayCategory(i.category)), ...presetSets])].filter(c => c && c !== 'ป้ายเหลือง');
    
    uniqueCats.sort((a, b) => a.localeCompare(b, 'th'));
    const datalistOptions = uniqueCats.map(c => `<option value="${c}">`).join('');

    const { value: formValues } = await Swal.fire({
        title: '📦 เพิ่มอุปกรณ์ใหม่', width: 600,
        html: `<div style="text-align: left; font-size: 14px; display: flex; flex-direction: column; gap: 12px;">
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">ชื่ออุปกรณ์</label>
                <input id="swal-name" class="premium-input" placeholder="เช่น SONY A7M4"></div>
                
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 2;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">หมวดหมู่</label>
                        <input id="swal-category" list="category-options" class="premium-input" placeholder=" คลิกเลือก หรือ พิมพ์หมวดใหม่...">
                        <datalist id="category-options">${datalistOptions}</datalist>
                    </div>
                    <div style="flex: 1;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">จำนวนสต็อก</label>
                        <input id="swal-stock" type="number" min="1" value="1" class="premium-input" style="text-align:center;">
                    </div>
                </div>
                
                <div>
                    <label style="color:#ff9800; display:flex; align-items:center; gap:10px; cursor:pointer; background:rgba(255,152,0,0.15); padding:12px; border-radius:8px; border: 1px solid rgba(255,152,0,0.5); transition: 0.3s;" onmouseover="this.style.background='rgba(255,152,0,0.25)'" onmouseout="this.style.background='rgba(255,152,0,0.15)'">
                        <input type="checkbox" id="swal-yellow-tag" style="width:20px; height:20px; cursor:pointer;">
                        <span><i class="fas fa-exclamation-triangle"></i> ตั้งเป็น <b>"อุปกรณ์ป้ายเหลือง"</b> (ใช้ในมอเท่านั้น)</span>
                    </label>
                </div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">ระดับความยาก</label>
                <select id="swal-difficulty" class="premium-input">
                    <option value="ระดับง่ายมาก (Beginner)">🟢 ง่ายมาก</option>
                    <option value="ระดับปานกลาง (Medium)">🟡 ปานกลาง</option>
                    <option value="ระดับค่อนข้างยาก (Advanced)">🟠 ค่อนข้างยาก</option>
                    <option value="ระดับมืออาชีพ (Pro)">🔴 มืออาชีพ</option>
                </select></div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">อัปโหลดรูปภาพอุปกรณ์</label>
                <input type="file" id="swal-image-file" accept="image/*" class="premium-input" style="padding: 9px 15px !important; cursor:pointer;"></div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">อ้างอิงข้อมูล</label>
                <input id="swal-ref" class="premium-input" placeholder="เช่น คู่มือผู้ใช้, DPreview"></div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">รายละเอียด / คำแนะนำเพิ่มเติม</label>
                <textarea id="swal-desc" class="premium-input" placeholder="คำอธิบายสเปค หรือ ข้อควรระวัง..."></textarea></div>
            </div>`,
        showCancelButton: true, confirmButtonText: '<i class="fas fa-save"></i> บันทึกอุปกรณ์', confirmButtonColor: '#28a745', background: '#1a1a1a', color: '#fff',
        preConfirm: async () => {
            const name = document.getElementById('swal-name').value; const category = document.getElementById('swal-category').value.trim();
            if(!name) { Swal.showValidationMessage('กรุณากรอกชื่ออุปกรณ์ด้วยครับ'); return false; }
            if(!category) { Swal.showValidationMessage('กรุณาระบุหมวดหมู่ด้วยครับ'); return false; }
            const fileInput = document.getElementById('swal-image-file'); 
            let finalImageUrl = "https://placehold.co/400x300?text=No+Image"; 
            
            if (fileInput.files.length > 0) { 
                try { 
                    Swal.showLoading(); 
                    const base64Full = await resizeImage(fileInput.files[0]); 
                    const base64Data = base64Full.split(',')[1]; 
                    finalImageUrl = await uploadToImgBB(base64Data);
                } catch (error) { 
                    Swal.showValidationMessage('เกิดข้อผิดพลาดในการประมวลผลหรืออัปโหลดรูปภาพ'); return false; 
                } 
            }
            
            return { 
                name: name, category: category, stock: parseInt(document.getElementById('swal-stock').value) || 1, image: finalImageUrl, 
                difficulty: document.getElementById('swal-difficulty').value, reference: document.getElementById('swal-ref').value || "อ้างอิงข้อมูลพื้นฐาน", 
                description: document.getElementById('swal-desc').value || "-", status: "available", condition: "good",
                isYellowTag: document.getElementById('swal-yellow-tag').checked
            }
        }
    });
    if (formValues) { Swal.fire({ title: 'กำลังบันทึกลงระบบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff'}); try { await addDoc(collection(db, "items"), formValues); Swal.fire({ icon: 'success', title: 'เพิ่มอุปกรณ์สำเร็จ!', timer: 1500, background: '#1a1a1a', color: '#fff', showConfirmButton:false }); } catch(e) { Swal.fire({icon:'error', title:'Error', text:e.message, background:'#1a1a1a', color:'#fff'}); } }
}

window.editItem = async function(id) {
    const item = items.find(i => i.id === id); if (!item) return;
    const diff = item.difficulty || "ระดับปานกลาง (Medium)"; const ref = item.reference || ""; const desc = item.description || ""; const stockVal = item.stock || 1; 
    const currentCatDisplay = (item.category === 'ป้ายเหลือง' || item.category === 'yellow') ? "" : getDisplayCategory(item.category);
    
    const presetSets = ['เซ็ตแดง', 'เซ็ตเขียว', 'เซ็ตเหลือง'];
    const uniqueCats = [...new Set([...items.map(i => getDisplayCategory(i.category)), ...presetSets])].filter(c => c && c !== 'ป้ายเหลือง');
    
    uniqueCats.sort((a, b) => a.localeCompare(b, 'th'));
    const datalistOptions = uniqueCats.map(c => `<option value="${c}">`).join('');

    const { value: formValues } = await Swal.fire({
        title: '✏️ แก้ไขข้อมูลอุปกรณ์', width: 600,
        html: `<div style="text-align: left; font-size: 14px; display: flex; flex-direction: column; gap: 12px;">
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">ชื่ออุปกรณ์</label>
                <input id="swal-edit-name" class="premium-input" value="${item.name}"></div>
                
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 2;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">หมวดหมู่</label>
                        <input id="swal-edit-category" list="category-options" class="premium-input" value="${currentCatDisplay}" placeholder=" คลิกเลือก หรือ พิมพ์หมวดใหม่...">
                        <datalist id="category-options">${datalistOptions}</datalist>
                    </div>
                    <div style="flex: 1;">
                        <label style="color:#aaa; display:block; margin-bottom:5px;">จำนวนสต็อก</label>
                        <input id="swal-edit-stock" type="number" min="1" value="${stockVal}" class="premium-input" style="text-align:center;">
                    </div>
                </div>
                
                <div>
                    <label style="color:#ff9800; display:flex; align-items:center; gap:10px; cursor:pointer; background:rgba(255,152,0,0.15); padding:12px; border-radius:8px; border: 1px solid rgba(255,152,0,0.5); transition: 0.3s;" onmouseover="this.style.background='rgba(255,152,0,0.25)'" onmouseout="this.style.background='rgba(255,152,0,0.15)'">
                        <input type="checkbox" id="swal-edit-yellow-tag" style="width:20px; height:20px; cursor:pointer;" ${item.isYellowTag ? 'checked' : ''}>
                        <span><i class="fas fa-exclamation-triangle"></i> ตั้งเป็น <b>"อุปกรณ์ป้ายเหลือง"</b> (ใช้ในมอเท่านั้น)</span>
                    </label>
                </div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">ระดับความยาก</label>
                <select id="swal-edit-difficulty" class="premium-input">
                    <option value="ระดับง่ายมาก (Beginner)" ${diff.includes('ง่าย') ? 'selected' : ''}>🟢 ง่ายมาก</option>
                    <option value="ระดับปานกลาง (Medium)" ${diff.includes('ปานกลาง') ? 'selected' : ''}>🟡 ปานกลาง</option>
                    <option value="ระดับค่อนข้างยาก (Advanced)" ${diff.includes('ค่อนข้างยาก') ? 'selected' : ''}>🟠 ค่อนข้างยาก</option>
                    <option value="ระดับมืออาชีพ (Pro)" ${diff.includes('มืออาชีพ') ? 'selected' : ''}>🔴 มืออาชีพ</option>
                </select></div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">เปลี่ยนรูปภาพ (ถ้าไม่เปลี่ยน ไม่ต้องเลือกไฟล์)</label>
                <input type="file" id="swal-edit-image-file" accept="image/*" class="premium-input" style="padding: 9px 15px !important; cursor:pointer;"></div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">อ้างอิงข้อมูล</label>
                <input id="swal-edit-ref" class="premium-input" value="${ref}"></div>
                
                <div><label style="color:#aaa; display:block; margin-bottom:5px;">รายละเอียด / คำแนะนำเพิ่มเติม</label>
                <textarea id="swal-edit-desc" class="premium-input">${desc}</textarea></div>
            </div>`,
        showCancelButton: true, confirmButtonText: '<i class="fas fa-save"></i> บันทึกการแก้ไข', confirmButtonColor: '#ffc107', background: '#1a1a1a', color: '#fff',
        preConfirm: async () => {
            const name = document.getElementById('swal-edit-name').value; const category = document.getElementById('swal-edit-category').value.trim();
            if (!name) { Swal.showValidationMessage('กรุณากรอกชื่ออุปกรณ์ด้วยครับ'); return false; } if (!category) { Swal.showValidationMessage('กรุณาระบุหมวดหมู่ด้วยครับ'); return false; }
            const fileInput = document.getElementById('swal-edit-image-file'); 
            let finalImageUrl = item.image; 
            
            if (fileInput.files.length > 0) { 
                try { 
                    Swal.showLoading(); 
                    const base64Full = await resizeImage(fileInput.files[0]); 
                    const base64Data = base64Full.split(',')[1];
                    finalImageUrl = await uploadToImgBB(base64Data);
                } catch (error) { 
                    Swal.showValidationMessage('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ'); return false; 
                } 
            }
            return { 
                name: name, category: category, stock: parseInt(document.getElementById('swal-edit-stock').value) || 1, image: finalImageUrl, 
                difficulty: document.getElementById('swal-edit-difficulty').value, reference: document.getElementById('swal-edit-ref').value, 
                description: document.getElementById('swal-edit-desc').value,
                isYellowTag: document.getElementById('swal-edit-yellow-tag').checked
            };
        }
    });
    if (formValues) { Swal.fire({ title: 'กำลังอัปเดตข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff'}); try { await updateDoc(doc(db, "items", id), formValues); Swal.fire({ icon: 'success', title: 'แก้ไขข้อมูลสำเร็จ!', timer: 1500, background: '#1a1a1a', color: '#fff', showConfirmButton: false }); } catch (error) { Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message, background: '#1a1a1a', color: '#fff' }); } }
}

window.updateDashboardStats = () => { 
    const statPending = document.getElementById('stat-pending'); if (statPending) statPending.innerText = borrowRequests.filter(r => r.status === 'pending').length;
    const statBorrowed = document.getElementById('stat-borrowed'); if (statBorrowed) statBorrowed.innerText = borrowRequests.filter(r => r.status === 'borrowed').length;
    const statTotalItems = document.getElementById('stat-total-items'); if (statTotalItems) statTotalItems.innerText = items.length; 
}

window.showAllBorrowersModal = function() {
    let htmlContent = `
        <div style="max-height: 60vh; overflow-y: auto; text-align: left; border-radius: 8px; border: 1px solid #333;">
            <table style="width: 100%; border-collapse: collapse; color: #fff; font-size: 14px;">
                <thead style="position: sticky; top: 0; background: #222; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
                    <tr>
                        <th style="padding: 12px; border-bottom: 2px solid #444; text-align: center; width: 15%;">อันดับ</th>
                        <th style="padding: 12px; border-bottom: 2px solid #444; width: 35%;">ชื่อนักศึกษา</th>
                        <th style="padding: 12px; border-bottom: 2px solid #444; text-align: center; width: 15%;">จำนวนที่ยืม (ครั้ง)</th>
                        <th style="padding: 12px; border-bottom: 2px solid #444; width: 35%;">ประวัติอุปกรณ์ที่ยืม</th>
                    </tr>
                </thead>
                <tbody>
    `;

    window.sortedUsersData.forEach((u, index) => {
        let rankColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#aaa';
        let rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        htmlContent += `
            <tr style="border-bottom: 1px solid #333; background: ${index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}; transition: 0.2s;">
                <td style="padding: 12px; font-weight: bold; color: ${rankColor}; text-align: center; font-size: 16px;">${rankIcon} #${index + 1}</td>
                <td style="padding: 12px; font-weight: bold;">${u.name}</td>
                <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--theme-primary); font-size: 16px;">${u.count}</td>
                <td style="padding: 12px; font-size: 12px; color: #bbb; line-height: 1.5;">${u.itemsText || '-'}</td>
            </tr>
        `;
    });

    htmlContent += `</tbody></table></div>`;

    Swal.fire({
        title: '🏆 จัดอันดับผู้ยืมทั้งหมด (Leaderboard)',
        html: htmlContent,
        width: 800,
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#ff6600',
        confirmButtonText: 'ปิดหน้าต่าง'
    });
}

window.renderStats = () => {
    let freq = {}; 
    let userStats = {}; 
    
    borrowRequests.filter(r => r.status !== 'rejected').forEach(req => { 
        let reqItemStr = String(req.item || ""); 
        let m; let rRegex = /([^,]+)\s*\((\d+)\s*ชิ้น\)/g; let f=false; 
        while((m=rRegex.exec(reqItemStr))!==null){ f=true; freq[m[1].trim()] = (freq[m[1].trim()]||0)+parseInt(m[2]); } 
        if(!f && reqItemStr) reqItemStr.split(',').forEach(it=>{ freq[it.trim()]=(freq[it.trim()]||0)+1; }); 
        
        let uName = req.user || "ไม่ทราบชื่อ";
        if (!userStats[uName]) { userStats[uName] = { count: 0, items: {} }; }
        userStats[uName].count += 1;
        
        let mUser; let rUserRegex = /([^,]+)\s*\((\d+)\s*ชิ้น\)/g; let fUser=false;
        while((mUser = rUserRegex.exec(reqItemStr)) !== null) {
            fUser = true; 
            let itemName = mUser[1].trim(); 
            let qty = parseInt(mUser[2]);
            userStats[uName].items[itemName] = (userStats[uName].items[itemName] || 0) + qty;
        }
        if(!fUser && reqItemStr) {
            reqItemStr.split(',').forEach(it => {
                let itemName = it.trim();
                if (itemName) {
                    userStats[uName].items[itemName] = (userStats[uName].items[itemName] || 0) + 1;
                }
            });
        }
    });
    
    window.sortedUsersData = Object.keys(userStats).map(k => {
        let sortedItems = Object.keys(userStats[k].items).sort((a,b) => userStats[k].items[b] - userStats[k].items[a]);
        let itemStrs = sortedItems.map(ik => `${ik} (x${userStats[k].items[ik]})`);
        return { name: k, count: userStats[k].count, itemsText: itemStrs.join(', ') };
    }).sort((a, b) => b.count - a.count);

    let top5Users = window.sortedUsersData.slice(0, 5);
    
    let statsSection = document.getElementById('section-stats');
    if (statsSection && !document.getElementById('userChartContainer')) {
        let userChartContainer = document.createElement('div');
        userChartContainer.id = 'userChartContainer';
        userChartContainer.style.cssText = 'margin-top: 30px; background: #1a1a1a; padding: 25px; border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 10px rgba(0,0,0,0.3);';
        userChartContainer.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <h3 style="margin:0; color:#fff; font-size:16px;">🏆 5 อันดับนักศึกษาที่ยืมอุปกรณ์บ่อยที่สุด</h3>
                <button onclick="window.showAllBorrowersModal()" style="background:var(--theme-primary); color:#000; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px; transition: 0.3s;">
                    <i class="fas fa-list-ol"></i> ดูรายชื่อจัดอันดับทั้งหมด
                </button>
            </div>
            <div style="position: relative; height: 300px; width: 100%;">
                <canvas id="userBorrowChart"></canvas>
            </div>
        `;
        statsSection.appendChild(userChartContainer);
    }
    
    let s = Object.keys(freq).map(k => ({n:k, c:freq[k]})).sort((a,b)=>b.c-a.c).slice(0,10);
    const ctxB = document.getElementById('borrowChart'); 
    if(ctxB) { 
        if(borrowChartInstance) borrowChartInstance.destroy(); 
        borrowChartInstance = new Chart(ctxB, { type:'bar', data: {labels: s.map(i=>i.n), datasets:[{label:'จำนวนการยืม (ครั้ง)', data:s.map(i=>i.c), backgroundColor:'#ff6600'}]}, options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero: true, ticks:{color:'#aaa', stepSize:1}},x:{ticks:{color:'#aaa'}}}} }); 
    }
    
    const ctxP = document.getElementById('conditionChart'); 
    if(ctxP) { 
        if(conditionChartInstance) conditionChartInstance.destroy(); 
        conditionChartInstance = new Chart(ctxP, { type:'doughnut', data: {labels:['ปกติ','ชำรุด/ซ่อม'], datasets:[{data:[items.filter(i=>i.condition!=='damaged').length, items.filter(i=>i.condition==='damaged').length], backgroundColor:['#198754','#dc3545'], borderWidth:0}]}, options:{plugins:{legend:{labels:{color:'#fff'}}}} }); 
    }
    
    const ctxU = document.getElementById('userBorrowChart');
    if (ctxU && top5Users.length > 0) {
        if (window.userChartInstance) window.userChartInstance.destroy();
        window.userChartInstance = new Chart(ctxU, {
            type: 'bar',
            data: {
                labels: top5Users.map(u => u.name.length > 20 ? u.name.substring(0,20)+'...' : u.name),
                datasets: [{
                    label: 'จำนวนครั้งที่ทำรายการยืม',
                    data: top5Users.map(u => u.count),
                    backgroundColor: '#0dcaf0',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y', 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                let userObj = top5Users[context.dataIndex];
                                let itemsList = userObj.itemsText.split(', ');
                                let tooltipText = ['--- ประวัติอุปกรณ์ที่ยืมบ่อย ---'];
                                itemsList.forEach((item, idx) => {
                                    if(idx < 5) tooltipText.push('- ' + item);
                                });
                                if(itemsList.length > 5) tooltipText.push('...และอื่นๆ (ดูเพิ่มเติมในปุ่มดูรายชื่อทั้งหมด)');
                                return tooltipText;
                            }
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { color: '#aaa', stepSize: 1 } },
                    y: { ticks: { color: '#fff', font: { size: 13 } } }
                }
            }
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
        let btns = currentUser && currentUser.id === u.id ? `<span style="color:#888;">(คุณเอง)</span>` : `<button onclick="changeUserRole('${u.id}', '${u.role}')" style="background:#28a745; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer; margin-right:5px;">สลับสิทธิ์</button><button onclick="deleteUser('${u.id}')" style="background:#dc3545; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer;"><i class="fas fa-trash"></i> ลบ</button>`;
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

function initApp() {
    if(document.getElementById('loginForm')) {
        window.toggleForm = () => { document.getElementById('loginForm').classList.toggle('hidden'); document.getElementById('registerForm').classList.toggle('hidden'); }
        document.getElementById('loginForm').onsubmit = (e) => { e.preventDefault(); window.login(document.getElementById('username').value, document.getElementById('password').value); };
        document.getElementById('registerForm').onsubmit = (e) => { e.preventDefault(); window.register(document.getElementById('regUser').value, document.getElementById('regPass').value, document.getElementById('regName').value); };
        
        const btnGoogle = document.getElementById('btnGoogleLogin');
        if(btnGoogle) {
            btnGoogle.onclick = window.loginWithGoogle;
        }

        if(currentUser) window.location.href = 'dashboard.html'; 
    }
    else if(document.getElementById('itemGrid')) {
        if(window.checkAuth()) { 
            window.listenToData(); window.updateCartCount();
            
            const borrowerInput = document.getElementById('cartBorrowerName');
            if (borrowerInput && !document.getElementById('cartGroupMembersContainer')) {
                const container = document.createElement('div');
                container.id = 'cartGroupMembersContainer';
                container.style.display = 'none';
                container.style.marginTop = '15px';
                container.style.marginBottom = '10px';
                container.innerHTML = `
                    <label style="color:#0dcaf0; display:block; margin-bottom:5px; font-weight:bold; font-size:14px;"><i class="fas fa-users"></i> รายชื่อสมาชิกในกลุ่ม (สำหรับการยืมแบบเซ็ต)</label>
                    <textarea id="cartGroupMembers" class="premium-input" placeholder="ระบุ ชื่อ-สกุล/รหัสนักศึกษา ของเพื่อนในกลุ่ม..."></textarea>
                `;
                borrowerInput.parentNode.insertBefore(container, borrowerInput.nextSibling);
            }

            if(document.getElementById('cartForm')) {
                document.getElementById('cartForm').onsubmit = async (e) => {
                    e.preventDefault(); 
                    const d = document.getElementById('cartBorrowDate').value; 
                    const retD = document.getElementById('cartReturnDate').value; 
                    const retT = document.getElementById('cartReturnTime').value; 
                    const r = document.getElementById('cartReason').value; 
                    const btn = document.querySelector('#cartForm button[type="submit"]');

                    const todayMs = new Date().setHours(0,0,0,0);
                    const borrowDateMs = new Date(d).setHours(0,0,0,0);
                    const returnDateMs = new Date(retD).setHours(0,0,0,0);
                    
                    const maxDateMs = new Date();
                    maxDateMs.setDate(new Date().getDate() + 15);
                    maxDateMs.setHours(0,0,0,0);

                    if(borrowDateMs < todayMs) return Swal.fire({icon: 'error', title: 'วันที่ผิด', text: 'ห้ามจองย้อนหลังเด็ดขาด', background: '#1a1a1a', color: '#fff'});
                    if(borrowDateMs > maxDateMs) return Swal.fire({icon: 'error', title: 'วันที่ผิด', text: 'จองล่วงหน้าได้ไม่เกิน 15 วัน', background: '#1a1a1a', color: '#fff'});
                    if(returnDateMs < borrowDateMs) return Swal.fire({icon: 'error', title: 'วันที่ผิด', text: 'วันคืนของต้องไม่ก่อนวันทำการจอง', background: '#1a1a1a', color: '#fff'});

                    const groupMemInput = document.getElementById('cartGroupMembers');
                    const groupMem = (groupMemInput && groupMemInput.parentElement.style.display !== 'none') ? groupMemInput.value.trim() : "";
                    let finalReason = r || "-";
                    if (groupMem) {
                        finalReason += `\n[สมาชิกกลุ่ม: ${groupMem}]`;
                    }

                    try {
                        btn.disabled = true; const itms = cart.map(i => `${i.name} (${i.qty} ชิ้น)`).join(', ');
                        await addDoc(collection(db, "requests"), { 
                            user: currentUser.name || currentUser.username, 
                            userId: currentUser.id, 
                            item: itms, date: d, returnDate: retD, returnTimeLimit: retT, 
                            reason: finalReason, 
                            status: "pending", timestamp: new Date() 
                        });
                        
                        let lineItemStr = itms;
                        if (groupMem) lineItemStr += `\n👥 สมาชิกกลุ่ม: ${groupMem}`;

                        fetch(LINE_API_URL, { 
                            method: 'POST', 
                            mode: 'no-cors', 
                            headers: { 'Content-Type': 'text/plain' }, 
                            body: JSON.stringify({ 
                                borrowerName: currentUser.name || currentUser.username, 
                                equipmentName: lineItemStr 
                            }) 
                        }).catch(e => console.error(e));
                        
                        Swal.fire({ icon: 'success', title: 'จองสำเร็จ!', timer: 2500, showConfirmButton: false, background: '#1a1a1a', color: '#fff' }); cart = []; window.updateCartCount(); window.renderItems(); window.closeCartModal();
                    } catch(e) { Swal.fire({icon:'error', title:'Error', text:e.message, background:'#1a1a1a', color:'#fff'}); } finally { btn.disabled = false; }
                };
            }
            
            const p = document.getElementById('pickupProofInput'); 
            if(p) p.onchange = async (e) => { 
                const file = e.target.files[0]; if(!file) return; 
                Swal.fire({title:'กำลังอัปโหลดรูปภาพ...', allowOutsideClick:false, didOpen:()=>Swal.showLoading(), background: '#1a1a1a', color: '#fff'}); 
                try{ 
                    const bFull = await resizeImage(file); 
                    const bData = bFull.split(',')[1];
                    const imgUrl = await uploadToImgBB(bData);
                    await updateDoc(doc(db, "requests", currentPickupId), { status: "borrowed", proofPhoto: imgUrl, pickupTime: new Date() }); 
                    Swal.fire({icon:'success',title:'สำเร็จ!',timer:2000,showConfirmButton:false, background: '#1a1a1a', color: '#fff'}); 
                    e.target.value=''; window.openHistoryModal(); 
                }catch(err){Swal.fire({icon:'error', title:'เกิดข้อผิดพลาด', text:err.message, background: '#1a1a1a', color: '#fff'});} 
            };
            
            const ret = document.getElementById('returnProofInput'); 
            if(ret) ret.onchange = async (e) => { 
                const file = e.target.files[0]; if(!file) return; 
                Swal.fire({title:'กำลังอัปโหลดรูปภาพ...', allowOutsideClick:false, didOpen:()=>Swal.showLoading(), background: '#1a1a1a', color: '#fff'}); 
                try{ 
                    const bFull = await resizeImage(file); 
                    const bData = bFull.split(',')[1];
                    const imgUrl = await uploadToImgBB(bData);
                    await updateDoc(doc(db, "requests", currentReturnId), { status: "pending_return", returnProofPhoto: imgUrl, returnTime: new Date() }); 
                    Swal.fire({icon:'success',title:'สำเร็จ!',timer:2000,showConfirmButton:false, background: '#1a1a1a', color: '#fff'}); 
                    e.target.value=''; window.openHistoryModal(); 
                }catch(err){Swal.fire({icon:'error', title:'เกิดข้อผิดพลาด', text:err.message, background: '#1a1a1a', color: '#fff'});} 
            };
        }
    }
    else if(document.getElementById('section-requests')) { const user = window.checkAuth(); if(user){ if(user.role !== 'admin') { Swal.fire({icon:'error', title:'ปฏิเสธ', text:'เฉพาะ Admin', background:'#1a1a1a', color:'#fff'}).then(()=>window.location.href='dashboard.html'); } else { window.listenToData(); document.getElementById('section-requests').style.display = 'block'; } } }
}
initApp();