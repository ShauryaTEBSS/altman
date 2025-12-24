// --- CONFIGURATION ---
const API_CONFIG = {
    baseUrl: "https://api.wise.live/v1", // Check Postman for exact Base URL
    apiKey: "b0e61c43dab6a18c12e0cbc6b4914cf9",         // From Wise Settings > Developer
    namespace: "altman"          // e.g., 'myschool'
};

// Helper: Generate Auth Headers
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "x-api-key": API_CONFIG.apiKey,
        "x-wise-namespace": API_CONFIG.namespace
    };
}

// 1. Fetch and Display Courses
async function loadCourses() {
    const grid = document.getElementById('course-grid');
    grid.innerHTML = "🕵️ Detective Mode: Searching for your API...";
    
    // We will test these 3 potential URL patterns
    const testUrls = [
        "https://api.wise.live/v1/course/list",           // Standard API
        "https://altman.wise.live/api/v1/course/list",    // Subdomain API
        "https://api.wise.live/v1/user/profile"           // Profile check (usually works)
    ];

    // ⚠️ MUST use Proxy for Mobile to avoid "Network Error"
    const proxy = "https://corsproxy.io/?"; 
    
    for (let url of testUrls) {
        console.log(`Testing: ${url}`);
        try {
            const response = await fetch(proxy + url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "b0e61c43dab6a18c12e0cbc6b4914cf9", // Your Key
                    "x-wise-namespace": "altman"
                }
            });

            const text = await response.text();
            
            // If we get valid JSON, we found the right door!
            try {
                const data = JSON.parse(text);
                console.log(`✅ SUCCESS at ${url}`, data);
                grid.innerHTML = `<h3 style="color:green">Found it!</h3><p>Working URL: ${url}</p>`;
                
                // If this was the profile endpoint, we connected, but need to find the course endpoint now
                if(url.includes("profile")) {
                    alert("Connection Successful! But 'Course List' path is still wrong. Check Wise Postman docs.");
                }
                return; // Stop testing, we found it
            } catch (e) {
                console.log(`❌ Failed at ${url}: Returned HTML (Page Not Found)`);
            }

        } catch (err) {
            console.log(`❌ Network/CORS Error at ${url}`);
        }
    }

    grid.innerHTML = `<h3 style="color:red">All tests failed.</h3><p>Check Console for details.</p>`;
}
// 2. Register User (Student)
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusDiv = document.getElementById('reg-status');
    statusDiv.innerText = "Registering...";

    const payload = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        role: "STUDENT"
    };

    try {
        // Example Endpoint: /user/add
        const response = await fetch(`${API_CONFIG.baseUrl}/user/add`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            statusDiv.innerHTML = `<span style="color:green">Success! User ID: ${result.userId}</span>`;
            // Save userId to localStorage for enrollment features
            localStorage.setItem('currentUserId', result.userId);
        } else {
            statusDiv.innerHTML = `<span style="color:red">Error: ${result.message}</span>`;
        }
    } catch (error) {
        statusDiv.innerText = "Network Error (Check CORS)";
    }
});

// 3. Enroll Function
async function enrollUser(courseId) {
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
        alert("Please register first!");
        toggleModal('loginModal');
        return;
    }

    if(confirm("Confirm enrollment for this course?")) {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/course/enroll`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ courseId: courseId, userId: userId })
            });
            
            const res = await response.json();
            if(response.ok) {
                alert("Enrolled successfully! Check your Wise app.");
            } else {
                alert("Enrollment failed: " + res.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to Wise.");
        }
    }
}

// UI: Toggle Modal
function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = (modal.style.display === "block") ? "none" : "block";
}

// Initialize
window.onload = loadCourses;
