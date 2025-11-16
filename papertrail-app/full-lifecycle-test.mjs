/* eslint-disable */

import { type } from "os";

const API_URL = "http://localhost:3000/api/papers";
const AUTH_TOKEN = process.env.API_AUTH_TOKEN || "my-secret-token";

const HEADERS = {
    ADMIN: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`,
        "x-user-role": "admin",
    },
    VIEWER: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`,
        "x-user-role": "viewer",
    }
};

const log = (msg, type = "info") => {
    const icons = {
        info: "ℹ️",
        success: "✅",
        error: "❌",
        step: "➡️"
    };
    console.log(`${icons[type]} ${msg}`);
};

async function runFullTestSuite() {
    console.log("Starting Full Lifecycle Test Suite...");

    let createdPaperId = null;

    // 1. Create Paper (Admin)
    console.log("➡️ Step 1: Create Paper (Admin)");
    const newPaper = {
        title: `Lifecycle Test Paper - ${Date.now()}`,
        abstract: "This paper is created as part of the full lifecycle test suite.",
        status: "Draft",
        primaryContactId: 1,
        venueId: 1
    };

    const createResponse = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS.ADMIN,
        body: JSON.stringify(newPaper)
    });

    if (createResponse.status === 201) {
        const data = await createResponse.json();
        createdPaperId = data.paper.id;
        log(`Paper created successfully with ID: ${createdPaperId}`, "success");
    } else {
        const errorData = await createResponse.json();
        log(`Failed to create paper. Status: ${createResponse.status}, Error: ${errorData.error}`, "error");
        return;
    }

    // 2. Verify Data Visibility
    // 2.1 As Viewer
    console.log("➡️ Step 2: Verify Data Visibility...");

    const viewResponse = await fetch(API_URL, {
        method: "GET",
        headers: HEADERS.VIEWER
    });
    const viewData = await viewResponse.json();
    const foundAsViewer = viewData.papers.find(p => p.id === createdPaperId);

    if (foundAsViewer) {
        log("Viewer can see the created paper.", "success");

        if (!foundAsViewer.primaryContact.email) {
            log("Security Check Passed: Sensitive fields are hidden from Viewer.", "success");
        } else {
            log("Security Check Failed: Sensitive fields are visible to Viewer.", "error");
        }
    } else {
        log("Viewer could not find the created paper.", "error");
    }

    // 2.2 As Admin
    const adminViewResponse = await fetch(API_URL, {
        method: "GET",
        headers: HEADERS.ADMIN
    });
    const adminViewData = await adminViewResponse.json();
    const foundAsAdmin = adminViewData.papers.some(p => p.id === createdPaperId);

    if (foundAsAdmin) {
        log("Admin can see the created paper.", "success");
    } else {
        log("Admin could not find the created paper.", "error");
    }

    // 3. Soft Delete Paper (Admin)
    console.log("➡️ Step 3: Soft Delete Paper (Admin)");

    const deleteResponse = await fetch(`${API_URL}?id=${createdPaperId}`, {
        method: "DELETE",
        headers: HEADERS.ADMIN
    });

    if (deleteResponse.status === 200) {
        log("Paper soft deleted successfully.", "success");
    } else {
        const deleteErrorData = await deleteResponse.json();
        log(`Failed to delete paper. Status: ${deleteResponse.status}, Error: ${deleteErrorData.error}`, "error");
        return;
    }

    // 4. Verify Deletion
    console.log("➡️ Step 4: Verify Deletion...");

    const verifyResponse = await fetch(API_URL, {
        method: "GET",
        headers: HEADERS.ADMIN
    });
    const verifyData = await verifyResponse.json();
    const isStillVisible = verifyData.papers.some(p => p.id === createdPaperId);

    if (!isStillVisible) {
        log("Deleted paper is no longer visible in standard queries.", "success");
    } else {
        log("Deleted paper is still visible in standard queries.", "error");
    }

    console.log("Full Lifecycle Test Suite Completed.");
}

runFullTestSuite();