document.addEventListener('DOMContentLoaded', function() {
    var gridContainer = document.getElementById('grid-container');
  
    for (var i = 0; i < 18; i++) {
      var gridItem = document.createElement('div');
      gridItem.className = 'grid-item';
      gridItem.style.opacity = 0; // set the starting opacity to 0
      gridContainer.appendChild(gridItem);
  
      var duration = 10; // 2 seconds animation duration
      var delay = Math.random() * duration; // random delay between 0 and the animation duration
  
      gridItem.style.animation = `pulse ${duration}s ${delay}s infinite ease-in-out`;
    }
  });
  