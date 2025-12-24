// ==========================================
//  WISE API INTEGRATION (Mobile/GitHub Pages)
// ==========================================

const API_CONFIG = {
    // 1. The Proxy (Required for Mobile/GitHub Pages)
    proxy: "https://cors-anywhere.herokuapp.com/",

    // 2. The Correct API Base URL
    // Note: We use 'wiseapp.live' based on the documentation, not 'wise.live'
    baseUrl: "https://api.wiseapp.live/v1",

    // 3. Your Credentials
    apiKey: "b0e61c43dab6a18c12e0cbc6b4914cf9",
    namespace: "altman"
};

// Helper: Generate Headers (Includes required User-Agent)
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "x-api-key": API_CONFIG.apiKey,
        "x-wise-namespace": API_CONFIG.namespace,
        // This header is often required by Wise to identify the integration
        "User-Agent": `VendorIntegrations/${API_CONFIG.namespace}`
    };
}

// ==========================================
//  FEATURE 1: LOAD COURSES
// ==========================================
async function loadCourses() {
    const grid = document.getElementById('course-grid');
    grid.innerHTML = '<p>🔄 Connecting to Wise...</p>';

    // Construct the full URL with Proxy
    // Endpoint: /course/list
    const fullUrl = `${API_CONFIG.proxy}${API_CONFIG.baseUrl}/course/list`;

    console.log("Fetching URL:", fullUrl);

    try {
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: getHeaders()
        });

        // ERROR HANDLING: Check if server replied with HTML (Page Not Found) instead of JSON
        const text = await response.text();
        
        if (!response.ok) {
            throw new Error(`Server Status ${response.status}: ${text.substring(0, 50)}...`);
        }

        try {
            var data = JSON.parse(text); // Try to parse the text as JSON
        } catch (e) {
            throw new Error("Server sent HTML, not JSON. URL might be wrong.");
        }

        console.log("✅ API Success:", data);

        // RENDER COURSES
        if (data.courses && data.courses.length > 0) {
            grid.innerHTML = ""; // Clear loader
            data.courses.forEach(course => {
                // Handle missing images
                const img = course.thumbnail || "https://via.placeholder.com/300x160?text=No+Image";
                
                grid.innerHTML += `
                    <div class="course-card">
                        <img src="${img}" class="course-img" alt="${course.name}">
                        <div class="card-body">
                            <h3>${course.name}</h3>
                            <p>${course.subject || "General Course"}</p>
                            <button class="enroll-btn" onclick="alert('To enroll, please register first!')">View Details</button>
                        </div>
                    </div>
                `;
            });
        } else {
            grid.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <h3>✅ Connected!</h3>
                    <p>But no courses were found in your Wise account.</p>
                    <p><small>Go to Wise Dashboard > Courses to create one.</small></p>
                </div>`;
        }

    } catch (error) {
        console.error(error);
        
        // Show helpful error on screen
        let msg = error.message;
        if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
            msg = "<b>CORS Blocked:</b> You must activate the proxy.";
        }

        grid.innerHTML = `
            <div style="color: red; border: 2px solid red; padding: 15px; background: #fff0f0; border-radius: 8px;">
                <h3>⚠️ Connection Failed</h3>
                <p>${msg}</p>
                <hr style="margin:10px 0; border:0; border-top:1px solid #ffcccc;">
                <p><strong>Fix:</strong> Click the button below, wait for "Access Granted", then come back and refresh.</p>
                <br>
                <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" 
                   style="background: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   🔓 Click to Activate Proxy
                </a>
            </div>
        `;
    }
}

// ==========================================
//  FEATURE 2: REGISTER STUDENT
// ==========================================
// Only attach this if the form exists in your HTML
const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusDiv = document.getElementById('reg-status');
        statusDiv.innerHTML = "⏳ Registering...";

        const payload = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value, // Wise needs strict phone format usually
            countryCode: "+91" // Assuming India, adjust if needed
        };

        try {
            // Endpoint: /user/add (Check docs if it's /user/create)
            const response = await fetch(`${API_CONFIG.proxy}${API_CONFIG.baseUrl}/user/add`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            const resData = await response.json();

            if (response.ok) {
                statusDiv.innerHTML = `<span style="color:green; font-weight:bold;">✅ Registered! ID: ${resData.id || "Success"}</span>`;
            } else {
                statusDiv.innerHTML = `<span style="color:red">❌ Error: ${resData.message || "Unknown error"}</span>`;
            }
        } catch (error) {
            console.error(error);
            statusDiv.innerHTML = `<span style="color:red">❌ Network Error. Check Proxy.</span>`;
        }
    });
}

// UI Helper: Modal Toggle
window.toggleModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = (modal.style.display === "block") ? "none" : "block";
    }
};

// Initialize on Load
window.onload = loadCourses;
