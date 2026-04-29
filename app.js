// Firebase Configuration (Aapka API Key pehle se add hai)
const firebaseConfig = {
    apiKey: 'AIzaSyAVW9aVzLWsGcmJUxgo5sb34Ljf9IkZ5iM',
    projectId: 'gen-lang-client-0577414319',
    authDomain: "gen-lang-client-0577414319.firebaseapp.com",
    storageBucket: "gen-lang-client-0577414319.appspot.com",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 16 Categories & Sub-Categories ---
const CATEGORIES_DATA = {
    "Repair & Service": ["Electrician (बिजली मिस्त्री)", "Plumber (प्लम्बर)", "Carpenter (बढ़ई)", "AC & Fridge Repair", "RO/Water Purifier", "Mechanic (गाड़ी मिस्त्री)"],
    "Property & Rentals": ["House for Rent", "Shop for Rent (दुकान)", "Agricultural Land (खेती की जमीन)", "Property Dealer"],
    "Agriculture (खेती)": ["Seed & Fertilizer (बीज-खाद)", "Tractor & Implements", "Dairy & Livestock (पशुपालन)", "Farm Labor (मजदूर)"],
    "Education & Skills": ["Home Tutors", "Coaching Centers", "Computer Training", "Skills Training"],
    "Daily Services": ["Laundry (धोबी)", "Barber (नाई)", "Tailor (दर्जी)", "Cleaning (सफाई)"],
    "Mandli & Labor": ["Construction Labor", "Painting (पुताई)", "Loading/Unloading", "Event Organizers"],
    "Shopkeepers": ["Grocery (किराना)", "Hardware Store", "Mobile Shop", "Garment Shop"],
    "Drivers & Vehicles": ["Truck Drivers", "Auto/Taxi Drivers", "Delivery Boys", "Rental Services"],
    "Medical & Health": ["Clinic / Doctor", "Medical Store", "Nursing Service", "Path Lab"],
    "Finance & Banking": ["Bank Mitra", "Insurances", "Loan Assistance"],
    "Govt Services": ["E-Mitra / CSC", "Legal Help", "Documentation"],
    "Livestock (पशुपालन)": ["Vet Doctor", "Animal Feed Store", "Poultry Farming"],
    "Catering": ["Cook / हलवाई", "Tiffin Service", "Restaurant/Dhaba"],
    "Digital & Tech": ["Graphics Designer", "SEO Expert", "Digital Marketing"],
    "Security": ["Security Guard", "CCTV Installation"],
    "Beauty & Spa": ["Beauty Parlour", "Mehndi Artist", "Barber Shop"]
};

// --- ऐप लोड होने पर चालू होने वाला फंक्शन ---
document.addEventListener('DOMContentLoaded', () => {
    populateCategorySelectors();
});

function populateCategorySelectors() {
    const regCat = document.getElementById('reg-category');
    const searchCat = document.getElementById('search-category');
    Object.keys(CATEGORIES_DATA).forEach(cat => {
        regCat.add(new Option(cat, cat));
        searchCat.add(new Option(cat, cat));
    });
}

function updateSubcategories(catId, subCatId) {
    const cat = document.getElementById(catId).value;
    const subCat = document.getElementById(subCatId);
    subCat.innerHTML = '<option value="">चुने...</option>';
    if (cat && CATEGORIES_DATA[cat]) {
        CATEGORIES_DATA[cat].forEach(sub => {
            subCat.add(new Option(sub, sub));
        });
    }
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.main-tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tabName}-section`).style.display = 'block';
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// --- वर्कर रजिस्ट्रेशन (Save Data) ---
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('reg-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'रजिस्टर हो रहा है...';

    const data = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        pincode: document.getElementById('reg-pincode').value,
        category: document.getElementById('reg-category').value,
        subcategory: document.getElementById('reg-subcategory').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        location: { lat: 0, lng: 0 } // Location Map Object
    };

    try {
        await db.collection('listings').add(data);
        alert('सफल! आपका रजिस्ट्रेशन हो गया है।');
        document.getElementById('register-form').reset();
        showTab('search');
    } catch (err) {
        console.error(err);
        alert('त्रुटि! डेटा सेव नहीं हुआ।');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'रजिस्टर करें';
    }
});

// --- सर्च फंक्शन ---
async function searchWorkers() {
    const pincode = document.getElementById('search-pincode').value;
    const category = document.getElementById('search-category').value;
    const resultsList = document.getElementById('results-list');
    const resultsCount = document.getElementById('results-count');

    if (!pincode) { alert('कृपया पिनकोड डालें!'); return; }

    resultsList.innerHTML = '<p class="placeholder-text">सर्च कर रहे हैं...</p>';
    
    try {
        let query = db.collection('listings').where('pincode', '==', pincode);
        if (category !== 'All') { query = query.where('category', '==', category); }

        const snapshot = await query.get();
        if (snapshot.empty) {
            resultsList.innerHTML = '<p class="placeholder-text">कोई वर्कर नहीं मिला।</p>';
            resultsCount.innerText = '';
            return;
        }

        resultsCount.innerText = `${snapshot.size} वर्कर मिले`;
        resultsList.innerHTML = '';
        snapshot.forEach(doc => {
            const worker = doc.data();
            resultsList.innerHTML += `
                <div class="worker-card">
                    <div class="worker-info">
                        <h3>${worker.name}</h3>
                        <p>📍 ${worker.pincode} • ${worker.subcategory}</p>
                    </div>
                    <a href="tel:${worker.phone}" class="call-btn">📞 कॉल</a>
                </div>
            `;
        });
    } catch (err) {
        resultsList.innerHTML = '<p class="placeholder-text">डेटा नहीं मिल सका।</p>';
    }
}
