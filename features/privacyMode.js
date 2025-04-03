document.addEventListener('DOMContentLoaded', function() {
  // 1) Always check localStorage to see if privacy mode is enabled.
  const privacyModeEnabled = JSON.parse(localStorage.getItem('privacyModeEnabled')) || false;

  // 2) If enabled, run the replacement logic on any page.
  if (privacyModeEnabled) {
    enablePrivacyMode();
  }

  // 3) Now see if the toggle switch is present (only on settings.html).
  const privacyToggle = document.getElementById('privacyModeToggle');
  if (privacyToggle) {
    // Set the toggle's initial state based on localStorage
    privacyToggle.checked = privacyModeEnabled;

    // Listen for toggle changes on the settings page
    privacyToggle.addEventListener('change', function() {
      localStorage.setItem('privacyModeEnabled', privacyToggle.checked);

      // If toggled ON, enable immediately
      if (privacyToggle.checked) {
        enablePrivacyMode();
      } else {
        // If toggled OFF, you can either reload or create a disablePrivacyMode() function
        location.reload();
      }
    });
  }
});

// The same enablePrivacyMode() function from before
function enablePrivacyMode() {
  // Replace all text nodes containing numbers with 'X'
  const elements = document.querySelectorAll('body *:not(script):not(style)');

  elements.forEach(el => {
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && /\d/.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/\d/g, 'X');
      }
    });
  });

  // Handle input elements containing numbers
  const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
  inputs.forEach(input => {
    if (/\d/.test(input.value)) {
      input.value = input.value.replace(/\d/g, 'X');
      input.disabled = true;  // Prevent editing when privacy mode is active
    }
  });
}

// Storage event listener for cross-tab updates (optional)
window.addEventListener('storage', function(event) {
  if (event.key === 'privacyModeEnabled') {
    location.reload();
  }
});
