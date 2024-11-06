import os
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
import e_awb_validator.validator
from PIL import Image
import e_awb_validator.ocr

app = Flask(__name__)

@app.route("/validate",methods=['GET'])
def validate():
    args = request.args
    waybill_number = args.get('q')
    return e_awb_validator.validator.ValidateAWB(waybill_number)

@app.route("/ocrupload",methods=['GET','POST'])
def ocrupload():
    if request.method == 'POST':
        if 'file1' not in request.files:
            return 'there is no file1 in form!'
        file1 = request.files['file1'].read()
        # Translate POST image to PIL's image
        # pillowimage = Image.open(file1)
        validawbs = e_awb_validator.ocr.searchAWBbyOCRimagebinary(file1)
        return str(validawbs)
    return '''
<form action="/ocrupload" method="post" enctype="multipart/form-data">
    <input type="file" id="file1" name="file1" accept="image/png, image/jpeg" />
    <input type="submit" value="Send Request" />
</form>
'''

@app.route("/")
def hello():
    return "Hello, World!"