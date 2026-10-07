import { ref, set, get } from "firebase/database";
import { database } from "./firebase";

const testRef = ref(database, "pulselogic_test");

export async function testFirebaseConnection() {
    try {
        // Write test data to Firebase
        await set(testRef, {
            status: "connected",
            message: "PulseLogic React connected to Firebase",
            timestamp: Date.now()
        });

        console.log("✅ FIREBASE WRITE SUCCESS");

        // Read the test data back from Firebase
        const snapshot = await get(testRef);

        if (snapshot.exists()) {
            console.log("✅ FIREBASE READ SUCCESS");
            console.log("Firebase data:", snapshot.val());
        } else {
            console.log("❌ FIREBASE READ FAILED");
        }

    } catch (error) {
        console.error("❌ FIREBASE ERROR:", error);
    }
}