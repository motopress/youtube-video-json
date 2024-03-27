(function () {
    const API_KEY = "AIzaSyAmCT442N0C8wPfABglR_YrWzhppE_wlhk";
    const API_URL = "https://www.googleapis.com/youtube/v3/videos";

    const form = document.getElementById('submit-form');
    const code = document.getElementById('video-json');
    const copyBTN = document.getElementById('copy-to-clipboard');

    if (!form || !code || !copyBTN) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        form.classList.remove('error');

        const userURLField = form.elements['youtube-link'];

        if (!userURLField) {
            form.classList.add('error');
            return;
        }

        const videoURLParams = new URLSearchParams(new URL(userURLField.value).search);
        const videoID = videoURLParams.get('v');

        if (!videoID) {
            form.classList.add('error');
            return;
        }

        fetchYTVideoInfo(videoID)
            .then((videoData) => {
                const video = videoData.items[0];

                if (!video) {
                    form.classList.add('error');
                    return;
                }

                let json = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "VideoObject",
                    "name": video.snippet.title,
                    "description": video.snippet.description.replace(/[\r\n]+/g, '&#13;&#10;'),
                    "thumbnailUrl": video.snippet.thumbnails.maxres != null ?
                        video.snippet.thumbnails.maxres.url :
                        video.snippet.thumbnails.default.url,
                    "uploadDate": video.snippet.publishedAt,
                    "duration": video.contentDetails.duration,
                    "keywords": video.snippet.tags,
                    "contentUrl": `https://youtube.com/watch/?v=${video.id}`,
                    "embedUrl": `https://www.youtube.com/embed/${video.id}`
                }, null, 4);

                code.innerHTML = '&lt;script type="application/ld+json"&gt;' + json + '&lt;/script&gt;';

            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                form.classList.add('error');
            });
    });

    copyBTN.addEventListener('click', (event) => {
        event.preventDefault();

        const valueToCopy = code.value;

        if (valueToCopy != '') {
            navigator?.clipboard?.writeText(valueToCopy)
                .then(
                    () => {
                        copyBTN.classList.add('success');
                        setTimeout( () => {
                            copyBTN.classList.remove('success');
                        }, 5000);
                    },
                    () => {
                        copyBTN.classList.add('failed');
                        setTimeout( () => {
                            copyBTN.classList.remove('failed');
                        }, 5000);
                    }
                );
        }
    });

    const fetchYTVideoInfo = async (id) => {
        const queryParams = new URLSearchParams({
            key: API_KEY,
            part: 'snippet,contentDetails,statistics',
            id: id
        }).toString();

        return fetch(`${API_URL}?${queryParams}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('YT response was not ok');
                }
                return response.json();
            });
    };

})();
