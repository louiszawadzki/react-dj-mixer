import youtube_dl
from flask import Flask

app = Flask(__name__)

class MyLogger(object):
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)


def my_hook(d):
    if d['status'] == 'finished':
        print('Done downloading, now converting ...')
    print(d)


ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'logger': MyLogger(),
    'outtmpl': '%(id)s.%(ext)s',
    'progress_hooks': [my_hook],
}

@app.route("/")
def hello():
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        result = ydl.download(['http://www.youtube.com/watch?v=BaW_jenozKc'])
        print(result)
    return "Hello World!"
