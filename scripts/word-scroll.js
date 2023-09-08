/**/

const scrollContainer = document.getElementById('scroll-container');
const words = ["Markets.", "Finance.", "Progress.", "Places.", "Returns.", "Impact."];
const wordClasses = "items-start";

const focusElement = 1;
const focusOpacity = 1;
const fadeoutElement = 2;
const fadeoutOpacity = 0.1;
const numElements = 4; 
let currentIndex = 0;


// Initialize the divs once.
function initializeWordList() {
    for (let i = 0; i < numElements; i++) {
        let wordDiv = document.createElement('div');
        wordDiv.classList.add(...wordClasses.split(' '));
        wordDiv.style.opacity = (i === focusElement)? focusOpacity : fadeoutOpacity;
        scrollContainer.appendChild(wordDiv);
    }
    updateWords();
}
function updateWords() {
    const children = scrollContainer.children;
    for (let i = 0; i < numElements; i++) {
        children[i].textContent = words[(currentIndex + i) % words.length];
    }
}

function animate() {
    // Animate downwards
    scrollContainer.style.transition = 'transform 1s cubic-bezier(.6,-0.3,.4,1.3)';
    scrollContainer.style.transform = 'translate3d(0, 25%, 0)';
    let children = scrollContainer.children;
 
    [focusElement, fadeoutElement].forEach(i => {
        children[i].style.transition = 'opacity 1s cubic-bezier(.6,-0.3,.4,1.3)';
        children[i].style.opacity = (i === focusElement) ? fadeoutOpacity : focusOpacity;
    });

    setTimeout(() => {
        // After animation ends
        scrollContainer.style.transition = 'none';
        scrollContainer.style.transform = 'translate3d(0, 0, 0)';

        [focusElement, fadeoutElement].forEach(i => {
            children[i].style.transition = 'none';
            children[i].style.opacity = (i === focusElement) ? focusOpacity : fadeoutOpacity;
        }); 

        currentIndex = (currentIndex + 1) % words.length;
        updateWords();
    }, 1000);
}

initializeWordList(); // Initialize once
setInterval(animate, 2500);
