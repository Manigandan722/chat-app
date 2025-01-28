import React from 'react'

const Test = () => {
     // Function to trigger notification
  const triggerNotification = (message) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("New Message", {
        body: `${message.sender.username}: ${message.content}`,
        // Optional: Path to an icon
      });

      // Optional: Add click behavior
      notification.onclick = () => {
        window.open("https://chat-app-mani.vercel.app/"); // Open your chat page
      };
    }
  };
  return (
    <div>Test</div>
  )
}

export default Test