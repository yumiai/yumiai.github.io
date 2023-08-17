const words = ["Markets", "Finance", "Progress", "Places", "Returns", "Impact"];
let currentIndex = -1;
const scrollContainer = document.getElementById('scroll-container');

let intervalId = null;

function generateWordList() {
  scrollContainer.innerHTML = ''; // Remove existing words  
  currentIndex = (currentIndex + 1) % words.length; // Cycle through words  
  for (let i = 0; i < 4; i++) {
    const wordIndex = (currentIndex + i) % words.length;
    const wordDiv = document.createElement('div');
    wordDiv.style.opacity = (i === 1) ? 1 : 0.1; // The second word is "active"
    wordDiv.className = 'flex flex-col items-start justify-center transition-opacity duration-[2s] h-[4.5rem]';
    wordDiv.textContent = words[wordIndex];
    scrollContainer.appendChild(wordDiv);
  }
}

function animate() {
  // Reset position
  scrollContainer.style.transform = 'translateY(0%)'; 
  // Change opacity of first and second words
  scrollContainer.children[1].style.opacity = 0.1;
  scrollContainer.children[2].style.opacity = 1;
  setTimeout(() => {
    scrollContainer.style.transition = 'transform 1s cubic-bezier(.6,-0.3,.4,1.3)'; // Add transition
    scrollContainer.style.transform = 'translateY(25%)'; // Animate downwards
    setTimeout(() => { // Delay reset to ensure animation ends
      scrollContainer.style.transition = 'none'; // Remove transition
      scrollContainer.style.transform = '';
      generateWordList(); // Generate new word list
      // Clear the interval and set it again
      clearInterval(intervalId);
      intervalId = setInterval(animate, 2500);
    }, 2000);
  }, 0);
}

// Generate the initial word list
generateWordList();

// Animate every 2.5s seconds
setTimeout(() => intervalId = setInterval(animate, 2500), 0);