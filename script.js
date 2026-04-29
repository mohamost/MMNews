// 1. الإعدادات
const firebaseConfig = {
  apiKey: "AIzaSyA52wrR30FbuHy9IAQkDyMODKRNHlUecKA",
  authDomain: "://firebaseapp.com",
  projectId: "mmmmnewsagency",
  storageBucket: "mmmmnewsagency.firebasestorage.app",
  messagingSenderId: "313225166201",
  appId: "1:313225166201:web:afc108766e42b9797143a8",
  measurementId: "G-KWLHM010X3"
};

// 2. التهيئة الفورية في أعلى النطاق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// 3. انتظر تحميل الصفحة بالكامل ثم اربط الأحداث
window.onload = function() {
    
    // ربط زر الدخول
    const loginAction = document.getElementById('btn-login-action');
    if(loginAction) {
        loginAction.addEventListener('click', function() {
            const email = document.getElementById('userEmail').value;
            const pass = document.getElementById('userPass').value;
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => { alert("مرحباً بك!"); showSection('home'); })
                .catch(err => alert("خطأ: " + err.message));
        });
    }

    // ربط زر التسجيل الجديد
    const signupAction = document.getElementById('btn-signup-action');
    if(signupAction) {
        signupAction.addEventListener('click', function() {
            const email = document.getElementById('userEmail').value;
            const pass = document.getElementById('userPass').value;
            auth.createUserWithEmailAndPassword(email, pass)
                .then(() => { alert("تم تسجيلك بنجاح!"); showSection('home'); })
                .catch(err => alert("خطأ: " + err.message));
        });
    }

    // تشغيل مراقب الحالة
    auth.onAuthStateChanged(user => {
        const loginBtn = document.getElementById('loginBtn');
        const adminBtn = document.getElementById('adminBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (user) {
            if(loginBtn) loginBtn.classList.add('hidden');
            if(adminBtn) adminBtn.classList.remove('hidden');
            if(logoutBtn) logoutBtn.classList.remove('hidden');
        } else {
            if(loginBtn) loginBtn.classList.remove('hidden');
            if(adminBtn) adminBtn.classList.add('hidden');
            if(logoutBtn) logoutBtn.classList.add('hidden');
        }
        loadNews();
    });

    document.getElementById('currentYear').innerText = new Date().getFullYear();
};

// دالة التنقل (يجب أن تظل خارج window.onload لتعمل مع الأزرار العلوية)
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id + '-section');
    if(target) target.classList.remove('hidden');
}

// دالة جلب الأخبار
function loadNews() {
    const container = document.getElementById('news-container');
    db.collection("news_posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        container.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const user = auth.currentUser;
            const displayTitle = user ? data.title : data.title.split(' ').slice(0, 5).join(' ') + "...";
            const displayContent = user ? data.content : "";

            container.innerHTML += `
                <div class="news-card">
                    <h4>${displayTitle}</h4>
                    <p>${displayContent}</p>
                    <button class="btn-details" onclick="alert('للتفاصيل: moha.most@gmail.com')">تفاصيل</button>
                </div>`;
        });
    });
}
