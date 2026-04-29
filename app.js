// Firebase Config
const firebaseConfig = {
    apiKey: 'AIzaSyAVW9aVzLWsGcmJUxgo5sb34Ljf9IkZ5iM',
    projectId: 'gen-lang-client-0577414319',
    authDomain: "gen-lang-client-0577414319.firebaseapp.com",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 22 Categories & Sub-Categories (Complete Version) ---
const CATEGORIES_DATA = {
    "1. सरकारी एवं प्रशासन": ["मंत्री", "जिला कलेक्टर / एसपी", "तहसीलदार / एसडीएम", "सरपंच", "ग्राम सेवक / सचिव", "पटवारी", "बीट कांस्टेबल / पुलिस", "वार्ड पंच", "पोस्ट मास्टर / डाकघर"],
    "2. खेती और भारी मशीनरी": ["ट्रैक्टर सेवा", "थ्रेशर", "कंबाइन हार्वेस्टर", "JCB / लोडर / क्रेन", "बोरवेल मशीन", "रोटावेटर / कल्टीवेटर", "स्प्रे पंप (ड्रोन सहित)", "रीपर / कटर / मिस्त्री"],
    "3. पशुपालन और डेयरी": ["पशु डॉक्टर", "AI वर्कर", "डेयरी / दूध / घी / पनीर", "पशु आहार", "चारा काटने वाले"],
    "4. मिस्त्री और कुशल कारीगर": ["इलेक्ट्रीशियन", "प्लंबर", "राज-मिस्त्री", "बढ़ई", "वेल्डर / लोहार", "पेंटर", "टाइल्स / मार्बल मिस्त्री"],
    "5. निर्माण सेवाएँ": ["आर्किटेक्ट", "कॉन्ट्रैक्टर", "रेत / बजरी / ईंट सप्लायर", "सीमेंट / सरिया सप्लायर"],
    "6. गाँव का बाज़ार": ["किराना", "मिठाई / नाश्ता", "सब्जी / फल", "कपड़ा / जूते", "खाद-बीज", "बर्तन", "श्रृंगार", "आटा चक्की"],
    "7. खाना और ठहरना": ["ढाबा / रेस्टोरेंट", "होटल / लॉज", "चाय स्टॉल"],
    "8. परिवहन": ["पिकअप / लोडर", "ट्रक / ट्रॉली", "ऑटो / ई-रिक्शा", "बाइक मैकेनिक", "पंचर दुकान"],
    "9. रिपेयर सेवाएँ": ["TV / फ्रिज / AC रिपेयर", "मोटर / पंखा रिपेयर", "इन्वर्टर / बैटरी"],
    "10. रोज़ाना सेवाएँ": ["नाई", "दर्जी", "मोची", "ताला-चाबी", "धार लगाने वाले", "धोबी"],
    "11. आयोजन": ["टेंट", "हलवाई", "डीजे", "फोटोग्राफर", "पंडित / मौलवी", "पानी सप्लाई"],
    "12. स्वास्थ्य और शिक्षा": ["डॉक्टर", "मेडिकल", "एम्बुलेंस", "स्कूल", "कोचिंग", "आंगनवाड़ी"],
    "13. डिजिटल सेवाएँ": ["ई-मित्र", "मोबाइल रिपेयर", "कंप्यूटर", "CCTV / सोलर"],
    "14. बैंकिंग और फाइनेंस": ["बैंक", "बीमा", "लोन", "मनी ट्रांसफर"],
    "15. सरकारी योजनाएँ": ["पेंशन सहायता", "राशन कार्ड", "आयुष्मान कार्ड", "किसान योजना"],
    "16. बिजली, पानी": ["बिजली विभाग", "जल विभाग", "गैस एजेंसी", "फायर ब्रिगेड"],
    "17. प्रॉपर्टी": ["जमीन खरीद-बिक्री", "किराया", "दुकान / गोदाम"],
    "18. महिला सेवाएँ": ["ब्यूटी पार्लर", "मेहंदी", "सिलाई सेंटर"],
    "19. कानूनी और सुरक्षा": ["वकील", "नोटरी", "जमीन सलाह"],
    "20. सफाई और मजदूरी": ["मजदूर", "सफाई कर्मचारी", "घरेलू काम"],
    "21. मनोरंजन": ["जिम", "गेमिंग", "पार्क"],
    "22. अन्य सेवाएँ": ["कबाड़ी", "पुराना सामान खरीद-बिक्री"]
};

let map, markers = [], userLocation = { lat: 26.9124, lng: 75.7873 };

document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    initMap();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
            userLocation = { lat: p.coords.latitude, lng: p.coords.longitude };
            map.setView([userLocation.lat, userLocation.lng], 13);
        });
    }
});

function initMap() {
    map = L.map('map').setView([userLocation.lat, userLocation.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

function populateCategories() {
    const reg = document.getElementById('reg-category'), src = document.getElementById('search-category');
    reg.innerHTML = '<option value="">कैटेगरी चुनें</option>';
    Object.keys(CATEGORIES_DATA).forEach(c => {
        reg.add(new Option(c, c));
        src.add(new Option(c, c));
    });
}

function updateSubcategories(srcId, targetId) {
    const cat = document.getElementById(srcId).value;
    const sub = document.getElementById(targetId);
    sub.innerHTML = '<option value="">सब-कैटेगरी चुनें</option>';
    if (cat && CATEGORIES_DATA[cat]) {
        CATEGORIES_DATA[cat].forEach(s => sub.add(new Option(s, s)));
    }
}

// --- पिनकोड से गांव सर्च करने का फंक्शन ---
async function fetchVillages() {
    const pin = document.getElementById('reg-pincode').value;
    if (pin.length === 6) {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
            const data = await response.json();
            if (data[0].Status === "Success") {
                const villages = data[0].PostOffice.map(po => po.Name);
                alert("इस पिनकोड के गांव मिल गए हैं: \n" + villages.join(", "));
                // आप चाहें तो गांवों का ड्रॉपडाउन भी यहाँ भर सकते हैं
            } else {
                alert("गलत पिनकोड!");
            }
        } catch (err) { console.log("API Error"); }
    }
}

// HTML के reg-pincode इनपुट में onblur="fetchVillages()" जोड़ें

function showTab(t) {
    document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.main-tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById(t + '-section').style.display = 'block';
    document.getElementById('tab-' + t).classList.add('active');
    if(t === 'search') setTimeout(() => map.invalidateSize(), 200);
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('reg-submit');
    btn.disabled = true; btn.innerText = 'रजिस्टर हो रहा है...';
    
    const data = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        pincode: document.getElementById('reg-pincode').value,
        category: document.getElementById('reg-category').value,
        subcategory: document.getElementById('reg-subcategory').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        location: userLocation
    };

    try {
        await db.collection('listings').add(data);
        alert('बधाई हो! ग्राम शक्ति पर आपका रजिस्ट्रेशन हो गया है।');
        document.getElementById('register-form').reset();
        showTab('search');
    } catch(e) { alert('डेटा सेव नहीं हुआ!'); }
    btn.disabled = false; btn.innerText = 'रजिस्टर करें';
});

async function searchWorkers() {
    const pin = document.getElementById('search-pincode').value, cat = document.getElementById('search-category').value;
    const list = document.getElementById('results-list'), count = document.getElementById('results-count');
    if(!pin) { alert('पिनकोड डालें!'); return; }
    
    list.innerHTML = 'खोज रहे हैं...';
    markers.forEach(m => map.removeLayer(m)); markers = [];

    try {
        let q = db.collection('listings').where('pincode', '==', pin);
        if(cat !== 'All' && cat !== '') q = q.where('category', '==', cat);
        const snp = await q.get();
        
        if(snp.empty) { 
            list.innerHTML = 'इस पिनकोड पर कोई वर्कर नहीं मिला।'; 
            count.innerText = '0 परिणाम';
            document.getElementById('map-container').style.display='none'; 
            return; 
        }
        
        document.getElementById('map-container').style.display='block';
        setTimeout(() => map.invalidateSize(), 200);
        count.innerText = snp.size + ' वर्कर मिले'; list.innerHTML = '';
        
        snp.forEach(d => {
            const w = d.data();
            if(w.location) {
                let m = L.marker([w.location.lat, w.location.lng]).addTo(map).bindPopup(`<b>${w.name}</b><br>${w.subcategory}`);
                markers.push(m);
            }
            list.innerHTML += `
                <div class="worker-card">
                    <div class="worker-info">
                        <h3>${w.name}</h3>
                        <p>🔹 ${w.subcategory}</p>
                        <p>📍 पिनकोड: ${w.pincode}</p>
                    </div>
                    <a href="tel:${w.phone}" class="call-btn">📞 कॉल</a>
                </div>`;
        });
        if(markers.length) map.fitBounds(L.featureGroup(markers).getBounds());
    } catch(e) { list.innerHTML = 'डेटा लोड करने में त्रुटि आई।'; }
}
