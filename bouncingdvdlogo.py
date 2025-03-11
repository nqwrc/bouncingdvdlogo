<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bouncing DVD Logo</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color: #000;
            font-family: Arial, sans-serif;
        }
        
        #container {
            position: relative;
            width: 100vw;
            height: 100vh;
        }
        
        #dvd-logo {
            position: absolute;
            width: 150px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
        }
        
        #instructions {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: white;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="dvd-logo">
            <svg viewBox="0 0 210 107" xmlns="http://www.w3.org/2000/svg">
                <path id="dvd-path" d="M118.895,20.346c0,0-13.743,16.922-13.04,18.001c0.975-1.079-4.934-18.186-4.934-18.186s-1.233-3.597-5.102-15.387H81.81H47.812H22.175l-2.56,11.068h19.299h4.579c12.415,0,19.995,5.132,17.878,14.225c-2.287,9.901-13.123,14.128-24.665,14.128H32.39l5.552-24.208H18.647l-8.192,35.368h27.398c20.612,0,40.166-11.067,43.692-25.288c0.617-2.614,0.53-9.185-1.054-13.053c0-0.093-0.091-0.271-0.178-0.537c-0.087-0.093-0.178-0.722,0.178-0.814c0.172-0.092,0.525,0.271,0.525,0.358c0,0,0.179,0.456,0.351,0.813l17.44,50.315l44.404-51.216l18.761-0.092h4.579c12.424,0,20.09,5.132,17.969,14.225c-2.29,9.901-13.205,14.128-24.75,14.128h-4.405L161,19.987h-19.208l-8.264,35.368h27.398c20.611,0,40.343-11.067,43.604-25.288c3.347-14.225-11.101-25.293-31.89-25.293h-18.143h-22.727C120.923,4.774,118.895,20.346,118.895,20.346L118.895,20.346z" fill="#ffffff" />
            </svg>
        </div>
        <div id="instructions">Use arrow keys to control the DVD logo</div>
    </div>

    <script>
        // Get the dvd logo element and SVG path
        const dvdLogo = document.getElementById('dvd-logo');
        const dvdPath = document.getElementById('dvd-path');
        const container = document.getElementById('container');
        
        // Set initial position and velocity
        let x = 50;
        let y = 50;
        let dx = 2;
        let dy = 2;
        let tempDx = 0;
        let tempDy = 0;
        
        const colors = [
            '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
            '#0000FF', '#4B0082', '#9400D3', '#FF00FF'
        ];
        
        // Set initial color
        let colorIndex = 0;
        dvdPath.setAttribute('fill', colors[colorIndex]);
        
        // Set initial size of the logo
        const logoWidth = 150;
        const logoHeight = 70;
        
        // Function to change the color
        function changeColor() {
            colorIndex = (colorIndex + 1) % colors.length;
            dvdPath.setAttribute('fill', colors[colorIndex]);
        }
        
        // Function to update the position
        function updatePosition() {
            // Get container dimensions
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Update position based on velocity
            x += dx;
            y += dy;
            
            // Check for collision with edges
            if (x <= 0 || x + logoWidth >= containerWidth) {
                dx = -dx;
                changeColor();
                x = Math.max(0, Math.min(x, containerWidth - logoWidth));
            }
            
            if (y <= 0 || y + logoHeight >= containerHeight) {
                dy = -dy;
                changeColor();
                y = Math.max(0, Math.min(y, containerHeight - logoHeight));
            }
            
            // Set the new position
            dvdLogo.style.left = x + 'px';
            dvdLogo.style.top = y + 'px';
            
            // Request next frame
            requestAnimationFrame(updatePosition);
        }
        
        // Start the animation
        updatePosition();
        
        // Add event listener for arrow keys
        document.addEventListener('keydown', (e) => {
            const speed = 2;
            
            switch (e.key) {
                case 'ArrowUp':
                    dy = -Math.abs(speed);
                    break;
                case 'ArrowDown':
                    dy = Math.abs(speed);
                    break;
                case 'ArrowLeft':
                    dx = -Math.abs(speed);
                    break;
                case 'ArrowRight':
                    dx = Math.abs(speed);
                    break;
                case ' ':  // Space bar to pause/resume
                    if (dx !== 0 || dy !== 0) {
                        // Store current direction
                        tempDx = dx;
                        tempDy = dy;
                        dx = 0;
                        dy = 0;
                    } else {
                        // Resume with stored direction
                        dx = tempDx || 2;
                        dy = tempDy || 2;
                    }
                    break;
            }
            
            // Prevent default behavior (scrolling)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    </script>
</body>
</html>
