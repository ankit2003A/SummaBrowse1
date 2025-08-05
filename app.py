from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
import os

from summarizers.pdf_processor import process_pdf
from summarizers.image_processor import process_image
from summarizers.video_processor import process_video

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/pdf/process", methods=["POST"])
def pdf_process():
    try:
        file = request.files['file']
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        summary = process_pdf(filepath)
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/image/process", methods=["POST"])
def image_process():
    try:
        file = request.files['file']
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        summary = process_image(filepath)
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/video/process", methods=["POST"])
def video_process():
    try:
        url = request.form['url']
        summary = process_video(url)
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/healthz")
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)