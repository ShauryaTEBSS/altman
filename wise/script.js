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
    
    try {
        // Example Endpoint: /course/list (Check Wise Docs for exact path)
        const response = await fetch(`${API_CONFIG.baseUrl}/course/list`, {
            method: "GET",
            headers: getHeaders()
        });

        const data = await response.json();

        if (data && data.courses) {
            grid.innerHTML = ""; // Clear loader
            data.courses.forEach(course => {
                grid.innerHTML += `
                    <div class="course-card">
                        <img src="${course.thumbnail || 'https://via.placeholder.com/300'}" class="course-img" alt="Course">
                        <div class="card-body">
                            <h3>${course.name}</h3>
                            <p>${course.description || "No description available."}</p>
                            <button class="enroll-btn" onclick="enrollUser('${course.id}')">Enroll Now</button>
                        </div>
                    </div>
                `;
            });
        } else {
            grid.innerHTML = "<p>No courses found or API error.</p>";
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
        grid.innerHTML = "<p>Failed to load courses. Check console for CORS/API errors.</p>";
    }
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
