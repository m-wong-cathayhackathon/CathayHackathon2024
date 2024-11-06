#Analyzes text in a document stored in an S3 bucket. Display polygon box around text and angled text 
import boto3
import io
from PIL import Image, ImageDraw
import json
from awb import validator
from fiveguysapi import settings

def process_text_analysis(s3_connection, client, bucket, document):

    # Get the document from S3                          
    s3_object = s3_connection.Object(bucket,document)
    s3_response = s3_object.get()

    stream = io.BytesIO(s3_response['Body'].read())
    image=Image.open(stream)

    # Analyze the document
    image_binary = stream.getvalue()
    # response = client.analyze_document(Document={'Bytes': image_binary},FeatureTypes=["TABLES", "FORMS", "SIGNATURES"])
    response = client.analyze_document(Document={'Bytes': image_binary},FeatureTypes=['TABLES'])

    result =[]
    blocks=response['Blocks']
    for block in blocks:
        if block['BlockType'] == 'LINE':
            result.append(dict(Confidence=block['Confidence'],Text=block['Text']))
    return result

def process_text_analysis_image_binary(image_binary,client):
    response = client.analyze_document(Document={'Bytes': image_binary},FeatureTypes=['TABLES'])

    result =[]
    blocks=response['Blocks']
    for block in blocks:
        if block['BlockType'] == 'LINE':
            result.append(dict(Confidence=block['Confidence'],Text=block['Text']))
    return result

def filter_non_awb(blocks:list):
    awbcandidates=[]
    # Extract possible awb from blocks
    for block in blocks:
        awbcandidate = ""
        text = block['Text'] 
        for char in text:
            if char.isdigit() or char=='-':
                awbcandidate+=char
        # awbcandidates.append(awbcandidate)
        # print(validator.validate_awb(awbcandidate))
        if validator.validate_awb(awbcandidate)['valid']:
            awbcandidates.append(awbcandidate)
                
    # Validate awb candidates
    # for awbcandidate in awbcandidates:
    
    filter_by_format = []
    for candidate in awbcandidates:
        if len(candidate) != 12 and candidate[3] != '-':
            continue
        filter_by_format.append(candidate)
    
    return filter_by_format
        
# INPUT:
# imageID (image name in bucket)
# OUTPUT:
# AWB which is validated

def searchAWBbyOCR(imageID):
    session = boto3.Session(
        aws_access_key_id=settings.AWS_SERVER_PUBLIC_KEY,
        aws_secret_access_key=settings.AWS_SERVER_SECRET_KEY,
    )
    s3_connection = session.resource('s3')
    client = session.client('textract', region_name='ap-southeast-1')
    bucket = "cathayhackathonimage"
    # document = "WhatsApp Image 2024-11-06 at 17.13.09.jpeg"
    document = imageID
    result=process_text_analysis(s3_connection, client, bucket, document)
    validAWBs = filter_non_awb(result)
    return validAWBs


def searchAWBbyOCRimagebinary(image_binary):
    session = boto3.Session(
        aws_access_key_id=settings.AWS_SERVER_PUBLIC_KEY,
        aws_secret_access_key=settings.AWS_SERVER_SECRET_KEY,
    )
    client = session.client('textract', region_name='ap-southeast-1')
    result=process_text_analysis_image_binary(image_binary,client)
    
    validAWBs = filter_non_awb(result)
    # print(validAWBs)
    return validAWBs