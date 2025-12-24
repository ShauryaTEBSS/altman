// ==========================================
//  WISE API INTEGRATION (Mobile/GitHub Pages)
// ==========================================

const API_CONFIG = {
    // 1. The Proxy (Keep this for mobile)
    proxy: "https://cors-anywhere.herokuapp.com/",

    // 2. The Correct API Base URL
    baseUrl: "https://api.wiseapp.live/v1",

    // 3. Your Credentials
    apiKey: "b0e61c43dab6a18c12e0cbc6b4914cf9",
    namespace: "altman",
    
    // ⚠️ IMPORTANT: You must paste your User ID here! ⚠️
    // Find this in Wise Dashboard > Settings > Developer
    userId: "694a448028118f629ea81724" 
};

// Helper: Generate Basic Auth Headers
function getHeaders() {
    // Basic Auth = Base64(userId:apiKey)
    const authString = btoa(`${API_CONFIG.userId}:${API_CONFIG.apiKey}`);
    
    return {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`, // The missing key!
        "x-wise-namespace": API_CONFIG.namespace,
        "User-Agent": `VendorIntegrations/${API_CONFIG.namespace}`
    };
}

// ==========================================
//  FEATURE: LOAD COURSES
// ==========================================
async function loadCourses() {
    const grid = document.getElementById('course-grid');
    grid.innerHTML = '<p>🔄 Authenticating...</p>';

    if (API_CONFIG.userId === "PASTE_YOUR_USER_ID_HERE") {
        grid.innerHTML = `<h3 style="color:red">⚠️ Missing User ID</h3><p>Please open script.js and paste your Admin User ID.</p>`;
        return;
    }

    const fullUrl = `${API_CONFIG.proxy}${API_CONFIG.baseUrl}/course/list`;
    console.log("Fetching URL:", fullUrl);

    try {
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: getHeaders()
        });

        const text = await response.text();
        
        if (!response.ok) {
            // If it still says 401, the UserID or Key is wrong
            throw new Error(`Server Status ${response.status}: ${text}`);
        }

        const data = JSON.parse(text);
        console.log("✅ API Success:", data);

        // Render Courses
        if (data.courses && data.courses.length > 0) {
            grid.innerHTML = ""; 
            data.courses.forEach(course => {
                const img = course.thumbnail || "https://via.placeholder.com/300x160?text=Course";
                grid.innerHTML += `
                    <div class="course-card">
                        <img src="${img}" class="course-img">
                        <div class="card-body">
                            <h3>${course.name}</h3>
                            <button class="enroll-btn">View</button>
                        </div>
                    </div>`;
            });
        } else {
            grid.innerHTML = `<h3>✅ Connected!</h3><p>No courses found. Create one in Wise Dashboard.</p>`;
        }

    } catch (error) {
        console.error(error);
        grid.innerHTML = `
            <div style="color: red; border: 1px solid red; padding: 10px;">
                <h3>Connection Failed</h3>
                <p>${error.message}</p>
            </div>`;
    }
}

// Initialize
window.onload = loadCourses;
