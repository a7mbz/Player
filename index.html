<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Premium Player</title>
    <link rel="icon" type="image/png" href="favicon.png">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; background-color: #121212; color: #fff; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        input { width: 70%; padding: 10px; border-radius: 5px; border: none; font-size: 16px; margin-bottom: 10px; }
        button { padding: 10px 20px; border-radius: 5px; border: none; background-color: #ff0000; color: #fff; font-size: 16px; cursor: pointer; }
        .video-container { margin-top: 20px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000; }
        .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Premium Player</h2>
        <input type="text" id="ytUrl" placeholder="Video link or ID here...">
        <button onclick="playVideo()">Play</button>
        <div class="video-container" id="player"></div>
    </div>

    <script>
        function playVideo() {
            const input = document.getElementById('ytUrl').value.trim();
            let videoId = '';
            
            // Comprehensive Regular Expression to match standard, short, mobile, and embed YouTube URLs
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = input.match(regExp);

            if (match && match[2].length === 11) {
                videoId = match[2];
            } else if (input.length === 11) {
                videoId = input; // If the user directly entered the 11-character ID
            }

            if (videoId) {
                // Using standard privacy-enhanced domain (Note: does not bypass video bans/ads)
                document.getElementById('player').innerHTML = 
                    `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            } else {
                alert('Invalid Link or Video ID!');
            }
        }
    </script>
</body>
</html>
