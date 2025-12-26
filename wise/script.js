// ==========================================
//  WISE API INTEGRATION (Auto-Scanner)
// ==========================================

const API_CONFIG = {
    proxy: "https://cors-anywhere.herokuapp.com/", // Must be active
    baseUrl: "https://api.wiseapp.live/v1",       // The Central API URL
    apiKey: "b0e61c43dab6a18c12e0cbc6b4914cf9",
    namespace: "altman",
    userId: "694a448028118f629ea81724" // <--- ⚠️ PASTE YOUR ADMIN USER ID HERE ⚠️
};

// Generate Auth Headers
function getHeaders() {
    if (API_CONFIG.userId.includes("PASTE")) {
        alert("⚠️ Please paste your User ID in script.js line 12!");
        throw new Error("Missing User ID");
    }
    const authString = btoa(`${API_CONFIG.userId}:${API_CONFIG.apiKey}`);
    return {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
        "x-wise-namespace": API_CONFIG.namespace,
        "User-Agent": `VendorIntegrations/${API_CONFIG.namespace}`
    };
}

async function loadCourses() {
    const grid = document.getElementById('course-grid');
    grid.innerHTML = '<p>🕵️ Scanning for correct API path...</p>';

    // We will test these paths one by one until we find the courses
    const pathsToTest = [
        "/courses",              // Most common standard
        "/programs",             // Wise often calls courses "Programs"
        "/course/list",          // Older version
        "/program/list",         // Older version
        "/institute/courses",    // Institute specific
        "/user/enrolled-courses" // Student specific
    ];

    let foundData = null;

    for (const path of pathsToTest) {
        const url = `${API_CONFIG.proxy}${API_CONFIG.baseUrl}${path}`;
        console.log(`Testing: ${path} ...`);

        try {
            const response = await fetch(url, { method: "GET", headers: getHeaders() });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ FOUND IT! Path is: ${path}`, data);
                
                // Check if it actually has a list of items
                const list = data.courses || data.programs || data.data || data;
                if (Array.isArray(list)) {
                    foundData = list;
                    grid.innerHTML = `<p style="color:green">✅ Connected to <b>${path}</b></p>`;
                    break; // Stop scanning, we found it!
                }
            } else {
                console.log(`❌ ${path}: ${response.status}`);
            }
        } catch (e) {
            console.log(`❌ Network Error on ${path}`);
        }
    }

    // RENDER RESULTS
    if (foundData) {
        grid.innerHTML = "";
        foundData.forEach(item => {
            const img = item.thumbnail || "https://via.placeholder.com/300x160?text=Course";
            grid.innerHTML += `
                <div class="course-card">
                    <img src="${img}" class="course-img">
                    <div class="card-body">
                        <h3>${item.name || item.title}</h3>
                        <p>ID: ${item.id}</p>
                    </div>
                </div>`;
        });
    } else {
        grid.innerHTML = `
            <div style="border: 2px solid red; padding: 15px; color: red;">
                <h3>❌ Scan Failed</h3>
                <p>Tried 6 different paths and none returned a course list.</p>
                <p><strong>Action:</strong> Open the Postman link you sent, click "Courses", and copy the exact path (e.g., /v1/something).</p>
            </div>`;
    }
}

window.onload = loadCourses;
