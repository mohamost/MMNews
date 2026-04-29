// 1. إعدادات فايربيس الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyA52wrR30FbuHy9IAQkDyMODKRNHlUecKA",
  authDomain: "mmmmnewsagency.firebaseapp.com",
  projectId: "mmmmnewsagency",
  storageBucket: "mmmmnewsagency.firebasestorage.app",
  messagingSenderId: "313225166201",
  appId: "1:313225166201:web:afc108766e42b9797143a8",
  measurementId: "G-KWLHM010X3"
};

// 2. التهيئة الفورية (يجب أن تكون في البداية)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// تحديث السنة في الفوتر تلقائياً
document.getElementById('currentYear').innerText = new Date().getFullYear();

// --- دوال التنقل والصلاحيات ---

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id + '-section');
    if(target) target.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// مراقبة حالة المستخدم (هل هو داخل أم خارج)
auth.onAuthStateChanged(user => {
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        loginBtn.classList.add('hidden');
        adminBtn.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        adminBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
    loadNews(); // تحديث الأخبار بناءً على الحالة الجديدة
});

// --- دوال الأخبار (الموظف) ---

function countWords() {
    let title = document.getElementById('newsTitle').value.trim();
    let words = title.split(/\s+/).filter(w => w.length > 0);
    document.getElementById('wordCountText').innerText = `الكلمات: ${words.length}/15`;
    if(words.length > 15) {
        document.getElementById('wordCountText').style.color = "red";
    } else {
        document.getElementById('wordCountText').style.color = "#ee2a35";
    }
}

async function uploadNews() {
    const titleInput = document.getElementById('newsTitle');
    const contentInput = document.getElementById('newsContent');
    
    if(!titleInput.value || !contentInput.value) return alert("يرجى إكمال البيانات");
    if(titleInput.value.split(/\s+/).length > 15) return alert("العنوان يتجاوز 15 كلمة!");

    try {
        await db.collection("news_posts").add({
            title: titleInput.value,
            content: contentInput.value,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // تصفير الحقول والعداد
        titleInput.value = "";
        contentInput.value = "";
        document.getElementById('wordCountText').innerText = "الكلمات: 0/15";

        // منطق الـ 150 عنوان: حذف الأقدم
        const snapshot = await db.collection("news_posts").orderBy("timestamp", "desc").get();
        if(snapshot.size > 150) {
            const oldestId = snapshot.docs[snapshot.size - 1].id;
            await db.collection("news_posts").doc(oldestId).delete();
        }

        alert("تم النشر بنجاح 🍉");
    } catch (error) {
        alert("خطأ في النشر: " + error.message);
    }
}

// --- دوال العرض (الزوار والمشتركين) ---

function loadNews() {
    const container = document.getElementById('news-container');
    const manageList = document.getElementById('manage-news-list');

    db.collection("news_posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        container.innerHTML = "";
        if(manageList) manageList.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const user = auth.currentUser;
            
            // القاعدة: 5 كلمات فقط للزائر، العنوان كاملاً للمسجل
            const displayTitle = user ? data.title : data.title.split(' ').slice(0, 5).join(' ') + "...";
            const displayContent = user ? data.content : "";

            container.innerHTML += `
                <div class="news-card">
                    <h4>${displayTitle}</h4>
                    <p>${displayContent}</p>
                    <button class="btn-details" onclick="alert('للحصول على مزيد من التفاصيل يرجى التواصل مع الادارة على الايميل moha.most@gmail.com')">تفاصيل</button>
                </div>
            `;

            if(user && manageList) {
                manageList.innerHTML += `
                    <div class="news-card" style="border-right-color: #555">
                        <p>${data.title}</p>
                        <button onclick="deleteNews('${doc.id}')">حذف 🗑️</button>
                    </div>
                `;
            }
        });
    });
}

function deleteNews(id) {
    if(confirm("هل أنت متأكد من حذف هذا الخبر؟")) {
        db.collection("news_posts").doc(id).delete();
    }
}

// --- دوال الحسابات ---

function handleSignUp() {
    const email = document.getElementById('userEmail').value;
    const pass = document.getElementById('userPass').value;
    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => { alert("تم تسجيل مشترك جديد بنجاح!"); showSection('home'); })
        .catch(err => alert("خطأ في التسجيل: " + err.message));
}

function handleAuth() {
    const email = document.getElementById('userEmail').value;
    const pass = document.getElementById('userPass').value;
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => { alert("مرحباً بك مجدداً!"); showSection('home'); })
        .catch(err => alert("خطأ في الدخول: " + err.message));
}

function handleLogout() {
    auth.signOut().then(() => {
        alert("تم تسجيل الخروج");
        location.reload(); // العودة للواجهة الأولى
    });
}
