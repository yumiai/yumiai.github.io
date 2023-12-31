// Function to close all modals
function closeAllModals() {
    var modals = document.querySelectorAll('.modal');
    var backdrops = document.querySelectorAll('.modal-backdrop');
    modals.forEach(function(modal) {
        modal.style.display = "none";
    });
    backdrops.forEach(function(backdrop) {
        backdrop.style.display = "none";
    });
}

function distanceToClosestPositionedAncestor(element) {
    var distance = 0;
    while (element && element !== document.documentElement) {
        if (window.getComputedStyle(element).position !== 'static') {
            return distance;
        }
        distance = element.offsetTop || 0;
        element = element.parentElement;
    }
    return distance; // No positioned ancestor found
}

// Function to initialize modal triggers
function initModalTriggers() {
    var triggers = document.querySelectorAll('[data-modal-target]');

    triggers.forEach(function(trigger) {
        var modalId = trigger.getAttribute('data-modal-target');
        var modal = document.querySelector(modalId);

        trigger.onclick = function(event) {
            closeAllModals(); // Close any open modals

            // Get position of SVG element relative to viewport
            var svgRect = trigger.getBoundingClientRect();
            // Get the positioned parent of the SVG element
            var distance = distanceToClosestPositionedAncestor(event.currentTarget);

            // Adjust for scrolling
            var scrollLeft = window.scrollX || document.documentElement.scrollLeft;
            var scrollTop = window.scrollY || document.documentElement.scrollTop;

            // Position modal
            var modal = document.querySelector(modalId);
            modal.style.display = "block";

            var test1 = svgRect.top;
    
            modal.style.left = (svgRect.left + scrollLeft + svgRect.width / 2 - modal.offsetWidth / 2) + 'px';
            modal.style.top = (distance + svgRect.height / 2 - modal.offsetHeight / 2) + 'px';

            // modal.style.top = (svgRect.top + scrollTop + svgRect.height / 2 - modal.offsetHeight / 2) + 'px';

            // Show the backdrop and reset timeout
            var backdrop = document.querySelector('.modal-backdrop');
            backdrop.style.display = "block";
            resetInactivityTimeout();
        };

        // Close modal when clicking on it
        var modal = document.querySelector(modalId);
        modal.onclick = function() {
            closeAllModals();
        };
    });
}


// Close the modal when user clicks on the backdrop
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-backdrop')) {
        closeAllModals();
    }
});

// Inactivity Timeout
var inactivityTimeout;

function resetInactivityTimeout() {
    clearTimeout(inactivityTimeout); // Clear the existing timeout
    inactivityTimeout = setTimeout(function() {
        closeAllModals(); // Close the modals after 5 seconds of inactivity
    }, 5000); // 5 seconds
}

// Initialize modal triggers
initModalTriggers();

// Reset the inactivity timeout on any interaction with the page
document.body.addEventListener('mousemove', resetInactivityTimeout);
document.body.addEventListener('keypress', resetInactivityTimeout);
document.body.addEventListener('touchstart', resetInactivityTimeout);
document.body.addEventListener('click', resetInactivityTimeout);




