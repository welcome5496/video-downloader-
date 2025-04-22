const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const videoUrl = req.body.video_url;
            const videoName = videoUrl.split('/').pop(); // Get filename from URL

            // Download the video using Axios
            const response = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream',
            });

            const filePath = path.resolve('/tmp', videoName);

            // Create a write stream to save the video file temporarily
            const writeStream = fs.createWriteStream(filePath);
            response.data.pipe(writeStream);

            writeStream.on('finish', () => {
                // Send the file back to the client
                res.setHeader('Content-Type', 'video/mp4');
                res.setHeader('Content-Disposition', `attachment; filename="${videoName}"`);
                fs.createReadStream(filePath).pipe(res);

                // Clean up the file after download
                writeStream.close();
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            res.status(500).send('Error downloading the video');
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
