# How to use

## Run the script on the server using forever
```
cd youtube-to-mp3
```
```
sudo forever start index.js ffmpeg=ffmpeg_path out=target_directory pw=password
```
Optional parameters:
```
privateKeyPath (default: keys/server.key)
certificatePath (default: keys/server.cert)
port (default: 8443)
```

## Send a POST request to
```
https://serverip:port/getmp3
```
Given the url
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
Send
```
{
	"videoId": "dQw4w9WgXcQ",
	"password": "password",
	"fileName": "Artist - Song"
}
```
