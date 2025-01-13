// Background Music Logic
const music = document.getElementById('backgroundMusic');
const toggleMusicButton = document.getElementById('toggleMusic');

// Handle Play/Mute Toggle on Button Click
toggleMusicButton.addEventListener('click', () => {
    if (music.paused) {
        music.play(); // Play the music
        toggleMusicButton.textContent = 'Mute Music'; // Update button text
    } else {
        music.pause(); // Pause the music
        toggleMusicButton.textContent = 'Play Music'; // Update button text
    }
});

// Prevent Spacebar from Affecting Audio
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement === toggleMusicButton) {
        e.preventDefault(); // Prevent spacebar from toggling music
    }
});


// Passwords and Characters
const characters = {
    "supercooldad": { name: "Dad", color: "blue", image: "Assets/Characters/dad.png" },
    "monkeydoodoo": { name: "Sister", color: "purple", image: "Assets/Characters/rachael.png" },
    "hungryhippo": { name: "Dad", color: "green", image: "Assets/Characters/kaima.png" },
    "napsgirl": { name: "Dad", color: "pink", image: "Assets/Characters/sophie.png" },
    "luvmymama": { name: "Dad", color: "red", image: "Assets/Characters/mom.png" },
    "guest": { name: "Guest", color: "grey", image: "Assets/Characters/sophie.png" },
};

const messages = {
    "supercooldad": "Merry Christmas, Dad! It's been another year together, and I'm grateful everyday that I have you to guide me with each coming new year :). \n\n Wishing you a season filled with love, joy, and success in all your endeavours (hehe!) as we celebrate Christmas together, love you! \n\n Love, \n - Sophie.E",
    "monkeydoodoo": "I weep for everyone who don't got a sister like you, like fr, who else would be the monkeydoodoo to my boss nigga? the Jeannette to my Brittany?? No one, that's who. Merry Christmas Queen, love you like crazy \n\n Love, \n - Sophie.E",
    "hungryhippo": "My small baby chigga, you cute tiny abomination. Love you like crazy tho. Even if you can't play basket ball on the Wii istg \n\n Love, \n - Sophie.E",
    "napsgirl": "Girl I can NOT believe you pulled this off wtf" ,
    "luvmymama": "Merry Christmas and Happy Birthday, Mom! It's been another year together, and another year I'm grateful that you've helped me grow to be the woman I am today. \n\n Thank you for the endless love, care, (and patience! hehe) you put into raising my sisters and I right. Wishing you a season filled with love, joy, and all the God-given goodies in between too. Love you mom, Happy Birthday, and Merry Christmas once again:D \n\n Love, \n - Sophie.E",
    "guest": "Congratualations! You made it! Hope you had fun trying out my silly lil project :D" ,
};

// Game Variables
let canvas, ctx, character, platforms,trees, score, timer, gameRunning, cabin, presents, coal;
let gravity = 0.3; // Smooth gravity for jump arcs
let jumpPower = -16; // Vertical jump strength
let keys = {};
let canDoubleJump = true; // Allows tracking for double jump
const groundHeight = 50;
const cameraOffset = { x: 0, y: 0 }; // Camera offset for scrolling
let finalPlatformIndex = 10; // Number of platforms before the cabin
const characterImages = {}; // Store preloaded images
const otherImages = {
    coal: "Assets/Other/coal.png",
    present: "Assets/Other/present.png",
    cabin: "Assets/Other/cabin.png",
    tree: "Assets/Other/tree3.png",
};
const loadedOtherImages = {};
const presentSize = 100; // Increased size for presents
const coalSize = 40;    // Increased size for coal
const characterSize = { width: 100, height: 100 }; // Increased size for character
const cabinSize = { width: 500, height: 500 };   // Increased size for cabin
let snowflakes = []; // Array to hold snowflake objects
let clouds = Array.from({ length: 5 }, () => ({
    x: Math.random() * 800, // Random horizontal position
    y: Math.random() * 100, // Random vertical position within the top 100 pixels
    width: 100 + Math.random() * 100, // Random width between 100 and 200 pixels
    speed: 0.5 + Math.random() * 1, // Random speed between 0.5 and 1.5
}));
const treeSize = 150; // Adjust size as needed


// Preload Character Images
function preloadImages() {
    Object.keys(characters).forEach((key) => {
        const img = new Image();
        img.src = characters[key].image;
        characterImages[key] = img;
    });
    Object.keys(otherImages).forEach((key) => {
        const img = new Image();
        img.src = otherImages[key];
        loadedOtherImages[key] = img;
    });
}

// Start the Game
function startGame() {
    const password = document.getElementById("passwordInput").value;
    const player = characters[password];

    if (!player) {
        document.getElementById("errorMessage").innerText =
            "Invalid password! Try again.";
        return;
    }

    // Hide password screen, show canvas
    document.getElementById("passwordScreen").style.display = "none";
    canvas = document.getElementById("gameCanvas");
    canvas.style.display = "block";
    canvas.width = 800;
    canvas.height = 400;
    ctx = canvas.getContext("2d");

    // Initialize Game
    platforms = Array.from({ length: finalPlatformIndex }, (_, i) => ({
        x: i * (300 + Math.random() * 100), // Randomize gaps between platforms
        y: canvas.height - groundHeight - (Math.random() * 100), // Randomize height
        width: 200 + Math.random() * 150, // Randomize width
    }));

    trees = Array.from({ length: 10 }, () => {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        return {
            x: platform.x + Math.random() * (platform.width - treeSize), // Random position on the platform
            y: platform.y - treeSize, // Place above the platform
        };
    });
    character = {
        x: 50,
        y: platforms[0].y - characterSize.height, // Place the character on the first platform
        width: characterSize.width,
        height: characterSize.height,
        dy: 0,
        color: player.color,
    };

    presents = Array.from({ length: 10 }, () => {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        return {
            x: platform.x + Math.random() * (platform.width - presentSize), // On the platform
            y: platform.y - presentSize, // Place on top of the platform
        };
    });

    coal = Array.from({ length: 5 }, () => {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        return {
            x: platform.x + Math.random() * (platform.width - coalSize), // On the platform
            y: platform.y - coalSize, // Place on top of the platform
        };
    });

    score = 0;
    timer = 0;
    gameRunning = true;
    cabin = {
        x: platforms[finalPlatformIndex - 1].x + (platforms[finalPlatformIndex - 1].width - cabinSize.width) / 2,
        y: platforms[finalPlatformIndex - 1].y - cabinSize.height,
        width: cabinSize.width,
        height: cabinSize.height,
    };

    // Start Timer
    setInterval(() => {
        if (gameRunning) timer++;
    }, 1000);

    // Game Loop
    requestAnimationFrame(gameLoop);

    // Display total presents
    const totalPresentsDisplay = document.getElementById("totalPresents");
    totalPresentsDisplay.innerText = `Total Presents: ${presents.length}`;


    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + cameraOffset.x; // Adjust for camera offset
        const mouseY = e.clientY - rect.top;

        // Check if the click is within the cabin's bounding box
        if (
            mouseX >= cabin.x &&
            mouseX <= cabin.x + cabin.width &&
            mouseY >= cabin.y &&
            mouseY <= cabin.y + cabin.height
        ) {
            endGame("win"); // Trigger the win scene when the cabin is clicked
        }
    });
}


// Update and Draw Clouds
function updateAndDrawClouds() {
    clouds.forEach((cloud) => {
        // Move the cloud to the left
        cloud.x -= cloud.speed;

        // Reset the cloud's position if it moves off-screen
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width; // Move to the far right
            cloud.y = Math.random() * 100; // Randomize the vertical position
            cloud.width = 100 + Math.random() * 100; // Randomize the width again
            cloud.speed = 0.5 + Math.random() * 1; // Randomize the speed again
        }

        // Draw the cloud
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Light white color
        ctx.beginPath();
        ctx.ellipse(
            cloud.x,
            cloud.y,
            cloud.width / 2, // Horizontal radius
            20, // Vertical radius (makes clouds flat)
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}


// Game Loop
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateAndDrawClouds();

    // Snow effect
    createSnowflakes(); // Add new snowflakes
    updateSnowflakes(); // Update their positions
    drawSnowflakes(); // Render the snowflakes
    

    // Update Camera Offset to Follow Character
    cameraOffset.x = character.x - canvas.width / 2;
    cameraOffset.x = Math.max(cameraOffset.x, 0); // Prevent scrolling back past start

    // Update Character
    if (keys["d"] || keys["D"]) character.x += 5; // Move right with D
    if (keys["a"] || keys["A"]) character.x -= 5; // Move left with A
    character.y += character.dy;
    character.dy += gravity; // Apply gravity

    // Prevent falling through the bottom
    if (character.y > canvas.height) endGame("lose");

    // Check Platform Collisions
    let onPlatform = false;
    let closestPlatformY = Infinity; // Track the closest valid platform

    platforms.forEach((platform) => {
        if (
            character.x + character.width > platform.x &&
            character.x < platform.x + platform.width &&
            character.y + character.height >= platform.y &&
            character.y + character.height - character.dy <= platform.y
        ) {
            if (platform.y < closestPlatformY) {
                closestPlatformY = platform.y;
                onPlatform = true;
                character.y = platform.y - character.height; // Align with the highest valid platform
            }
        }
    });

    if (onPlatform) {
        character.dy = 0; // Stop falling
        canDoubleJump = true; // Reset double jump when on a platform
    }

    // If not on a platform, ensure gravity is applied
    if (!onPlatform && character.dy < 20) {
        character.dy += gravity;
    }

    // Draw Everything
    ctx.save();
    ctx.translate(-cameraOffset.x, 0); // Apply camera offset for scrolling

    drawPlatforms();
    drawTrees();
    drawCabin();
    drawCharacter();
    drawPresents();
    drawCoal();
    

    ctx.restore();

    // Display Score and Timer
    ctx.fillStyle = "green";
    ctx.font = "bold 18px Time New Roman";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Time: ${timer}s`, 10, 40);

    requestAnimationFrame(gameLoop);
}

function drawPlatforms() {
    ctx.fillStyle = "white"; // Set the platform color to white to resemble snow
    platforms.forEach((platform) => {
        ctx.fillRect(platform.x, platform.y, platform.width, 50); // Increase thickness (height of 20 for a snow-like appearance)
    });
}
function createSnowflakes() {
    const maxSnowflakes = 100; // Adjust for more or fewer snowflakes

    if (snowflakes.length < maxSnowflakes) {
        snowflakes.push({
            x: Math.random() * canvas.width, // Random horizontal position
            y: Math.random() * canvas.height, // Random vertical position
            radius: Math.random() * 3 + 1, // Random size for variety
            speed: Math.random() * 1 + 0.5 // Random speed
        });
    }
}

function updateSnowflakes() {
    snowflakes.forEach((flake) => {
        flake.y += flake.speed; // Move downward
        if (flake.y > canvas.height) {
            flake.y = 0; // Reset to top
            flake.x = Math.random() * canvas.width; // Randomize horizontal position
        }
    });
}

function drawSnowflakes() {
    ctx.fillStyle = "white"; // Snowflake color
    ctx.shadowBlur = 10; // Add a glow effect to snowflakes
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    snowflakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0; // Reset shadow for other elements
}


function drawTrees() {
    trees.forEach((tree) => {
        if (loadedOtherImages.tree) {
            ctx.drawImage(loadedOtherImages.tree, tree.x, tree.y, treeSize, treeSize);
        } else {
            // Fallback to a placeholder rectangle if the image is not loaded
            ctx.fillStyle = "brown";
            ctx.fillRect(tree.x, tree.y, treeSize, treeSize);
        }
    });
}




function drawCharacter() {
    const password = document.getElementById("passwordInput").value;
    const characterImage = characterImages[password];

    if (characterImage) {
        ctx.drawImage(characterImage, character.x, character.y, characterSize.width, characterSize.height);
    } else {
        // Fallback to a colored rectangle if the image fails
        ctx.fillStyle = character.color;
        ctx.fillRect(character.x, character.y, characterSize.width, characterSize.height);
    }
}

function drawPresents() {
    for (let i = presents.length - 1; i >= 0; i--) {
        const present = presents[i];
        if (loadedOtherImages.present) {
            ctx.drawImage(loadedOtherImages.present, present.x, present.y, presentSize, presentSize);
        } else {
            ctx.fillStyle = "gold";
            ctx.fillRect(present.x, present.y, presentSize, presentSize);
        }
        if (
            character.x + character.width - 5 > present.x &&
            character.x + 5 < present.x + presentSize &&
            character.y + character.height - 5 > present.y &&
            character.y + 5 < present.y + presentSize
        ) {
            score++;
            presents.splice(i, 1); // Remove collected present
            const totalPresentsDisplay = document.getElementById("totalPresents");
            totalPresentsDisplay.innerText = `Total Presents: ${presents.length}`; // Update remaining presents
        }
    }
}

function drawCoal() {
    for (let i = coal.length - 1; i >= 0; i--) {
        const c = coal[i];
        if (loadedOtherImages.coal) {
            ctx.drawImage(loadedOtherImages.coal, c.x, c.y, coalSize, coalSize);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(c.x, c.y, coalSize, coalSize);
        }
        if (
            character.x + character.width - 5 > c.x &&
            character.x + 5 < c.x + coalSize &&
            character.y + character.height - 5 > c.y &&
            character.y + 5 < c.y + coalSize
        ) {
            timer += 3; // Add 3 seconds to the timer
            coal.splice(i, 1); // Remove collected coal
        }
    }
}

function drawCabin() {
    if (loadedOtherImages.cabin) {
        ctx.drawImage(loadedOtherImages.cabin, cabin.x, cabin.y, cabinSize.width, cabinSize.height);
    } else {
        ctx.fillStyle = "red";
        ctx.fillRect(cabin.x, cabin.y, cabinSize.width, cabinSize.height);
    }

}

// Handle Keyboard Input
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.code === "Space") {
        if (character.dy === 0) {
            character.dy = jumpPower; // Jump
        } else if (canDoubleJump) {
            character.dy = jumpPower; // Double Jump
            canDoubleJump = false; // Disable further jumps until reset
        }
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// End Game
async function endGame(result) {
    gameRunning = false;

    const password = document.getElementById("passwordInput").value;
    const player = characters[password]?.name || "Unknown";
    const characterImage = characterImages[password]; // Get the character's image

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "1000";

    const messageBox = document.createElement("div");
    messageBox.classList.add("messageBox"); // Apply the CSS class

    const message = document.createElement("p");
    message.innerText = result === "win"
        ? `${messages[password]}\n\nYour Score: ${score} out of 10 gifts in ${timer}s.`
        : `Game Over!\n\nYour Score: ${score} out of 10 gifts in ${timer}s.`;
    message.style.margin = "0"; // Remove default paragraph margin

    // Add the character image (small version)
    const characterContainer = document.createElement("div");
    characterContainer.style.margin = "15px 0"; // Add spacing
    characterContainer.style.width = "80px";
    characterContainer.style.height = "80px";
    characterContainer.style.borderRadius = "50%";
    characterContainer.style.overflow = "hidden"; // Circle effect for the image
    characterContainer.style.display = "flex";
    characterContainer.style.justifyContent = "center";
    characterContainer.style.alignItems = "center";
    characterContainer.style.backgroundColor = "white"; // Fallback background

    if (characterImage) {
        const charImg = document.createElement("img");
        charImg.src = characterImage.src;
        charImg.style.width = "100%";
        charImg.style.height = "100%";
        charImg.style.objectFit = "cover"; // Ensure the image fits well
        characterContainer.appendChild(charImg);
    } else {
        // Fallback if no character image
        characterContainer.style.backgroundColor = "#ccc"; // Gray background
        characterContainer.style.display = "flex";
        characterContainer.style.justifyContent = "center";
        characterContainer.style.alignItems = "center";
        characterContainer.innerText = "No Image";
    }

    const playAgainButton = document.createElement("button");
    playAgainButton.innerText = "Play Again";
    playAgainButton.style.marginTop = "20px";
    playAgainButton.style.padding = "10px 20px";
    playAgainButton.style.fontSize = "16px";
    playAgainButton.style.cursor = "pointer";
    playAgainButton.addEventListener("click", () => {
        document.body.removeChild(overlay); // Remove overlay
        startGame(); // Restart the game without going back to the password screen
    });

    messageBox.appendChild(message);
    overlay.appendChild(messageBox);
    overlay.appendChild(characterContainer); // Append the character image container
    overlay.appendChild(playAgainButton);
    document.body.appendChild(overlay);
}

// Preload character and other images at the start
preloadImages();
