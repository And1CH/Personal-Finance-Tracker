

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration – replace with your credentials
const firebaseConfig = {
  apiKey: "AIzaSyBu294QDq5U5sipx8LmIRgZTfvSL7GA_sM",
  authDomain: "personalfinancetrackerdb.firebaseapp.com",
  databaseURL: "https://personalfinancetrackerdb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "personalfinancetrackerdb",
  storageBucket: "personalfinancetrackerdb.appspot.com",
  messagingSenderId: "404141477300",
  appId: "1:404141477300:web:90d2185768e64c6169b6e1",
  measurementId: "9H4NRQ68DJ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

window.app = app; // Expose if needed

/** Wrap everything that references the DOM in DOMContentLoaded **/
document.addEventListener("DOMContentLoaded", () => {
  /************************************************
   * PROFILE PICTURE SETUP
   ***********************************************/
  function setProfilePicture(username) {
    if (!username) return;
    const initialEl = document.getElementById('profile-initial');
    const pictureEl = document.getElementById('profile-picture');
    if (!initialEl || !pictureEl) return; // guard if they don't exist

    const initial = username.charAt(0).toUpperCase();
    initialEl.textContent = initial;
    // Generate a random background color
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    pictureEl.style.backgroundColor = randomColor;
  }
  
  // Example usage
  setProfilePicture("johnDoe");

  /************************************************
   * MESSAGE MODAL FUNCTIONS
   ***********************************************/
  function handleMessageClick() {
    openMessageBox();
  }
  function openMessageBox() {
    updateDataSharingMenu();
    const modal = document.getElementById("messageModal");
    const container = document.getElementById("messageContainer");
    if (!modal || !container) return; // guard if they don't exist

    modal.style.display = "flex";
    container.offsetHeight; // force reflow
    container.style.opacity = 1;
    container.style.transform = "translateY(0)";
  }
  function closeMessageModal() {
    const modal = document.getElementById("messageModal");
    const container = document.getElementById("messageContainer");
    if (!modal || !container) return;

    container.style.opacity = 0;
    container.style.transform = "translateY(20px)";
    setTimeout(() => {
      modal.style.display = "none";
    }, 500);
  }

  const messageForm = document.getElementById("messageForm");
  if (messageForm) {
    messageForm.addEventListener("submit", function(e) {
      e.preventDefault();
      alert("Message sent!");
      closeMessageModal();
    });
  }

  /************************************************
   * DATA SHARING MINI MENU (in message modal)
   ***********************************************/
  function updateDataSharingMenu() {
    const sharingEnabled = (localStorage.getItem('shareDataEnabled') === 'true');
    const container = document.getElementById("dataSharingContainer");
    const expanded = document.getElementById("dataSharingExpanded");
    const expandedContent = document.querySelector(".data-sharing-expanded-content");
    const lockIcon = document.getElementById("lockIcon");
    if (!container || !expanded) return;

    if (!sharingEnabled) {
      container.style.height = "120px";
      if (lockIcon) lockIcon.style.display = "inline-block";
      expanded.style.opacity = 0;
      expanded.style.transform = "translateY(10px)";
      if (expandedContent) expandedContent.style.pointerEvents = "none";
    } else {
      container.style.height = "auto";
      if (lockIcon) lockIcon.style.display = "none";
      expanded.style.opacity = 1;
      expanded.style.transform = "translateY(0)";
      if (expandedContent) expandedContent.style.pointerEvents = "auto";
    }
  }

  /************************************************
   * NOTIFICATIONS LOGIC
   ***********************************************/
  function getNotifications() {
    return JSON.parse(localStorage.getItem('notifications')) || [];
  }
  function saveNotifications(notifs) {
    localStorage.setItem('notifications', JSON.stringify(notifs));
  }
  function addNotification({ text, icon, type }) {
    const notifs = getNotifications();
    notifs.push({
      id: Date.now().toString(),
      text,
      icon,
      type,
      read: false
    });
    saveNotifications(notifs);
  }
  function markNotificationRead(notificationId) {
    const notifs = getNotifications();
    const index = notifs.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifs[index].read = true;
      saveNotifications(notifs);
    }
    openNotificationsMenu();
  }

  async function checkBudgetsAndGoals() {
    try {
      if (!auth.currentUser) {
        console.warn("No authenticated user");
        return;
      }
      const userId = auth.currentUser.uid;
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        console.log("No data found for user:", userId);
        return;
      }
      const data = snapshot.val();
      // Check Budget usage
      if (data.budgets && data.budgets.daily) {
        const { used, limit } = data.budgets.daily;
        const usagePercent = (used / limit) * 100;
        if (usagePercent >= 80 && usagePercent < 100) {
          addNotification({
            text: "Careful with spending, you're over 80% of your daily budget!",
            icon: "💸",
            type: "budget"
          });
        } else if (usagePercent >= 100) {
          addNotification({
            text: "You've exceeded your daily budget!",
            icon: "⚠️",
            type: "budget"
          });
        }
      }
      // Check Goals
      if (data.goals) {
        Object.keys(data.goals).forEach(goalId => {
          const goal = data.goals[goalId];
          if (!goal.completed && goal.savedSoFar >= goal.targetAmount) {
            update(ref(db, `users/${userId}/goals/${goalId}`), { completed: true });
            addNotification({
              text: `Congratulations on achieving your goal: ${goal.name}!`,
              icon: "🎉",
              type: "goal"
            });
          }
        });
      }
    } catch (error) {
      console.error("Error checking budgets/goals:", error);
    }
  }

  async function handleBellClick() {
    const welcomeEnabled = (localStorage.getItem('welcomeNotificationsEnabled') === 'true');
    if (!welcomeEnabled) {
      alert("Enable welcome notifications from the settings tab!");
    } else {
      await checkBudgetsAndGoals();
      console.log("Bell icon clicked!");
      openNotificationsMenu();
    }
  }

  function openNotificationsMenu() {
    const notifications = getNotifications();
    let menuHtml = "";
    if (notifications.length === 0) {
      menuHtml = `<div style="padding:10px; text-align:center; color:#888;">No new notifications.</div>`;
    } else {
      menuHtml = "<ul style='list-style:none; padding:10px; margin:0;'>";
      notifications.forEach(notif => {
        const style = notif.read ? "notif-read" : "notif-unread";
        menuHtml += `<li class="${style}" style="padding:10px; border-bottom:1px solid #eee; cursor:pointer;"
            onclick="markNotificationRead('${notif.id}')">
            ${notif.icon ? notif.icon + " " : ""}${notif.text}
          </li>`;
      });
      menuHtml += "</ul>";
    }
    let notifMenu = document.getElementById("notificationsMenu");
    if (!notifMenu) {
      notifMenu = document.createElement('div');
      notifMenu.id = "notificationsMenu";
      notifMenu.style.position = "absolute";
      notifMenu.style.top = "60px";
      notifMenu.style.right = "130px";
      notifMenu.style.backgroundColor = "#fff";
      notifMenu.style.border = "1px solid #ccc";
      notifMenu.style.borderRadius = "6px";
      notifMenu.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
      notifMenu.style.padding = "10px";
      notifMenu.style.zIndex = 10000;
      document.body.appendChild(notifMenu);
    }
    notifMenu.innerHTML = menuHtml;
    notifMenu.style.display = 'block';

    document.addEventListener('click', function handler(e) {
      if (!notifMenu.contains(e.target) && e.target.id !== 'bell-icon' && !e.target.closest('#bell-icon')) {
        notifMenu.style.display = 'none';
        document.removeEventListener('click', handler);
      }
    });
  }

  // Expose needed functions to the window if your HTML calls them inline:
  window.handleBellClick = handleBellClick;
  window.handleMessageClick = handleMessageClick;
  window.markNotificationRead = markNotificationRead;
  window.checkBudgetsAndGoals = checkBudgetsAndGoals;
});