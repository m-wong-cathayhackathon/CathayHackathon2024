from flask import Flask, request
import e_awb_validator.validator
app = Flask(__name__)

@app.route("/validate",methods=['GET'])
def validate():
    args = request.args
    waybill_number = args.get('q')
    return e_awb_validator.validator.ValidateAWB(waybill_number)

@app.route("/")
def hello():
    return "Hello, World!"