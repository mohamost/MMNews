// --- إعدادات فايربيس (ضع بياناتك هنا) ---
const firebaseConfig = {
  apiKey: "AIzaSyA52wrR30FbuHy9IAQkDyMODKRNHlUecKA", 
  authDomain: "mmmmnewsagency.firebaseapp.com",
  projectId: "mmmmnewsagency",
  storageBucket: "mmmmnewsagency.firebasestorage.app",
  messagingSenderId: "313225166201",
  appId: "1:313225166201:web:afc108766e42b9797143a8",
   measurementId: "G-KWLHM010X3"
};
// 2. التهيئة (هذا الجزء يجب أن يسبق أي دالة أخرى)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// تشغيل فايربيس
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.getElementById('currentYear').innerText = new Date().getFullYear();

// وظيفة التنقل
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    const section = document.getElementById(id + '-section');
    if(section) section.classList.remove('hidden');
    window.scrollTo(0,0);
}


  
// عداد الكلمات وتصفيره
function countWords() {
    let title = document.getElementById('newsTitle').value.trim();
    let words = title.split(/\s+/).filter(w => w.length > 0);
    document.getElementById('wordCountText').innerText = `الكلمات: ${words.length}/15`;
    if(words.length > 15) alert("العنوان لا يجب أن يتجاوز 15 كلمة!");
}

// إضافة خبر جديد (للموظف)
async function uploadNews() {
    const title = document.getElementById('newsTitle').value;
    const content = document.getElementById('newsContent').value;

    if(!title || !content) return alert("أكمل البيانات أولاً");

    await db.collection("news_posts").add({
        title: title,
        content: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // منطق الـ 150 عنوان
    const snapshot = await db.collection("news_posts").orderBy("timestamp", "desc").get();
    if(snapshot.size > 150) {
        await db.collection("news_posts").doc(snapshot.docs[snapshot.size-1].id).delete();
    }

    alert("تم النشر بنجاح!");
    document.getElementById('newsTitle').value = "";
    document.getElementById('newsContent').value = "";
    document.getElementById('wordCountText').innerText = "الكلمات: 0/15"; // تصفير العداد
}

// عرض الأخبار
function loadNews() {
    db.collection("news_posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const container = document.getElementById('news-container');
        const manageList = document.getElementById('manage-news-list');
        container.innerHTML = "";
        manageList.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const user = auth.currentUser;

            // منطق عرض 5 كلمات للزائر والعنوان كاملاً للمشترك
            const displayTitle = user ? data.title : data.title.split(' ').slice(0, 5).join(' ') + "...";
            const displayContent = user ? data.content : "";

            container.innerHTML += `
                <div class="news-card">
                    <h4>${displayTitle}</h4>
                    <p>${displayContent}</p>
                    <button class="btn-details" onclick="alert('للحصول على مزيد من التفاصيل يرجى التواصل مع الادارة على الايميل moha.most@gmail.com')">تفاصيل</button>
                </div>
            `;

            if(user) {
                manageList.innerHTML += `
                    <div class="news-card">
                        <p>${data.title}</p>
                        <button onclick="deleteNews('${doc.id}')">حذف 🗑️</button>
                    </div>
                `;
            }
        });
    });
}
// دالة التسجيل (ستعمل الآن لأن auth تم تعريفه في الأعلى)
        
}
// نظام تسجيل الدخول والخروج
function handleSignUp() {
    const email = document.getElementById('userEmail').value;
    const pass = document.getElementById('userPass').value;
    auth.createUserWithEmailAndPassword(email, pass)
      .then(() => { alert("تم تسجيلك!"); showSection('home'); })
  .catch(err => { alert(err.message); });
}

function handleAuth() {
    const email = document.getElementById('userEmail').value;
    const pass = document.getElementById('userPass').value;
    auth.signInWithEmailAndPassword(email, pass).then(() => { alert("مرحباً بك!"); showSection('home'); });
}

function handleLogout() {
    auth.signOut().then(() => { location.reload(); });
}

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
        document.getElementById('adminBtn').classList.remove('hidden');
    }
    loadNews();
});
