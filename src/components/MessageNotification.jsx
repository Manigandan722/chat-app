import React, { useEffect } from 'react';

const MessageNotification = () => {
  // Check if the browser supports notifications and request permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted!");
          } else {
            console.log("Notification permission denied.");
          }
        });
      }
    } else {
      console.log("Your browser does not support notifications.");
    }
  }, []);

  // Function to send a notification
  const sendNotification = (message) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("New Message", {
        body: message,
        icon: "https://example.com/icon.png", // Optional: URL to an icon
      });

      // Optional: Add a click event to open a URL
      notification.onclick = function () {
        window.open("");
      };
    }
  };

  // Simulate receiving a message after a timeout (replace with your actual message logic)
  useEffect(() => {
    const timer = setTimeout(() => {
      sendNotification("You have received a new message!");
    }, 3000); // Simulates receiving a message after 3 seconds

    return () => clearTimeout(timer); // Clean up timer on component unmount
  }, []);

  return <div>Message Notification Example</div>;
};

export default MessageNotification;
