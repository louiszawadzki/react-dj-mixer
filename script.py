import youtube_dl
import os
from flask import Flask, request, url_for, send_from_directory
from flask_cors import CORS
from bpm_detector import get_bpm_from_file

app = Flask(__name__)
CORS(app)

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


ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'wav',
        'preferredquality': '96',
    }],
    'outtmpl': './files/%(id)s.%(ext)s',
    'progress_hooks': [my_hook],
}

@app.route("/download/<string:youtube_id>")
def download(youtube_id):
    if os.path.isfile('./files/%s.wav' % youtube_id):
        return url_for("send_files", path="%s.wav" % youtube_id, _external=True)
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        full_url = 'https://www.youtube.com/watch?v=%s' % youtube_id
        result = ydl.download([full_url])
        return url_for("send_files", path="%s.wav" % youtube_id, _external=True)

@app.route('/files/<path:path>')
def send_files(path):
    return send_from_directory('files', path)

@app.route('/files/<path:path>/bpm')
def get_bpm(path):
    bpm = get_bpm_from_file('./files/%s' % path)
    return str(bpm)
