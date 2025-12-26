// ==========================================
//  WISE API INTEGRATION (Final Fix)
// ==========================================

const API_CONFIG = {
    // 1. The Proxy (Required for Mobile)
    proxy: "https://cors-anywhere.herokuapp.com/",

    // 2. The Base URL (From your snippet)
    baseUrl: "https://api.wiseapp.live", 

    // 3. Credentials
    apiKey: "b0e61c43dab6a18c12e0cbc6b4914cf9",
    namespace: "altman",
    
    // ⚠️ PASTE YOUR ADMIN USER ID HERE ⚠️
    userId: "694a448028118f629ea81724" 
};

// Generate Headers (Exactly as per your snippet)
function getHeaders() {
    // Basic Auth is REQUIRED: Base64(userId:apiKey)
    const authString = btoa(`${API_CONFIG.userId}:${API_CONFIG.apiKey}`);
    
    return {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`, 
        "x-api-key": API_CONFIG.apiKey,       // Send it again as per snippet
        "x-wise-namespace": API_CONFIG.namespace,
        "user-agent": "VendorIntegrations/altman"
    };
}

async function loadCourses() {
    const grid = document.getElementById('course-grid');
    grid.innerHTML = '<p>🔄 Connecting to Wise /user/v2/classes...</p>';

    // 🎯 TARGET ENDPOINT: List all classes
    // We remove the {{class_id}} to get the whole list
    const endpoint = "/user/v2/classes"; 
    
    // Full URL with Proxy + Endpoint + Query Param
    const fullUrl = `${API_CONFIG.proxy}${API_CONFIG.baseUrl}${endpoint}?full=true`;

    console.log("Fetching:", fullUrl);

    try {
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: getHeaders()
        });

        const text = await response.text();
        
        if (!response.ok) {
            throw new Error(`Server Error ${response.status}: ${text}`);
        }

        const data = JSON.parse(text);
        console.log("✅ SUCCESS:", data);

        // Wise usually returns { data: [...] } or just [...]
        const courses = data.data || data; 

        if (Array.isArray(courses) && courses.length > 0) {
            grid.innerHTML = ""; 
            courses.forEach(item => {
                // Handle different image field names (thumbnail vs cover_image)
                const img = item.cover_image || item.thumbnail || "https://via.placeholder.com/300x160?text=Class";
                
                grid.innerHTML += `
                    <div class="course-card">
                        <img src="${img}" class="course-img">
                        <div class="card-body">
                            <h3>${item.name || item.topic || "Untitled Class"}</h3>
                            <p>ID: ${item.id}</p>
                            <button class="enroll-btn" onclick="alert('Class ID: ${item.id}')">View Class</button>
                        </div>
                    </div>`;
            });
        } else {
            grid.innerHTML = `<h3>✅ Connected!</h3><p>But no classes found. Create a "Class" in your Wise Dashboard.</p>`;
        }

    } catch (error) {
        console.error(error);
        grid.innerHTML = `
            <div style="color:red; border:1px solid red; padding:10px;">
                <h3>Connection Failed</h3>
                <p>${error.message}</p>
                <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" style="background:#333;color:white;padding:5px;">Re-Activate Proxy</a>
            </div>`;
    }
}

window.onload = loadCourses;
