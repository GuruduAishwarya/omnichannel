import { useEffect, useState } from "react";

export const useTwentyFourHoursTimer = (twentyFourHoursTimer) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (twentyFourHoursTimer) {
            // Step 1: Parse the given timestamp correctly to handle the timezone
            const timerStart = new Date(twentyFourHoursTimer); // The timestamp from API (e.g. 2024-12-18T19:44:02+05:30)
            const timerEnd = timerStart.getTime() + 24 * 60 * 60 * 1000; // Add 24 hours (in milliseconds)

            const now = new Date().getTime(); // Get current time in milliseconds

            // Step 2: Calculate the difference between the end time and the current time
            const difference = timerEnd - now;

            if (difference > 0) {
                // If the time difference is positive, calculate the time left
                setIsExpired(false);
                setTimeLeft(difference);
            } else {
                // If the 24 hours are already over
                setIsExpired(true);
                setTimeLeft(0);
            }

            // Step 3: Start a countdown interval to update the remaining time
            const countdownInterval = setInterval(() => {
                const currentTime = new Date().getTime();
                const newDifference = timerEnd - currentTime;

                if (newDifference <= 0) {
                    clearInterval(countdownInterval); // Stop the countdown
                    setIsExpired(true);
                    setTimeLeft(0);
                } else {
                    setTimeLeft(newDifference);
                }
            }, 1000);

            // Cleanup interval on component unmount
            return () => clearInterval(countdownInterval);
        }
    }, [twentyFourHoursTimer]);

    // Step 4: Format the time left in hours:minutes:seconds
    const formatCountdown = (milliseconds) => {
        if (!milliseconds || milliseconds <= 0) return "00:00:00";
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    };

    return { isExpired, timeLeft: formatCountdown(timeLeft) };
};