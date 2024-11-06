#Analyzes text in a document stored in an S3 bucket. Display polygon box around text and angled text 
import boto3
import io
from PIL import Image, ImageDraw
import json
import validator

def ShowBoundingBox(draw,box,width,height,boxColor):
             
    left = width * box['Left']
    top = height * box['Top'] 
    draw.rectangle([left,top, left + (width * box['Width']), top +(height * box['Height'])],outline=boxColor)   

def ShowSelectedElement(draw,box,width,height,boxColor):
             
    left = width * box['Left']
    top = height * box['Top'] 
    draw.rectangle([left,top, left + (width * box['Width']), top +(height * box['Height'])],fill=boxColor)  

# Displays information about a block returned by text detection and text analysis
def DisplayBlockInformation(block):
    print('Id: {}'.format(block['Id']))
    if 'Text' in block:
        print('    Detected: ' + block['Text'])
    print('    Type: ' + block['BlockType'])
   
    if 'Confidence' in block:
        print('    Confidence: ' + "{:.2f}".format(block['Confidence']) + "%")

    if block['BlockType'] == 'CELL':
        print("    Cell information")
        print("        Column:" + str(block['ColumnIndex']))
        print("        Row:" + str(block['RowIndex']))
        print("        Column Span:" + str(block['ColumnSpan']))
        print("        RowSpan:" + str(block['ColumnSpan']))    
    
    if 'Relationships' in block:
        print('    Relationships: {}'.format(block['Relationships']))
    print('    Geometry: ')
    print('        Bounding Box: {}'.format(block['Geometry']['BoundingBox']))
    print('        Polygon: {}'.format(block['Geometry']['Polygon']))
    
    if block['BlockType'] == "KEY_VALUE_SET":
        print ('    Entity Type: ' + block['EntityTypes'][0])
    
    if block['BlockType'] == 'SELECTION_ELEMENT':
        print('    Selection element detected: ', end='')

        if block['SelectionStatus'] =='SELECTED':
            print('Selected')
        else:
            print('Not selected')    
    
    if 'Page' in block:
        print('Page: ' + block['Page'])
    print()

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

    ### Uncomment to process using S3 object ###
    #response = client.analyze_document(
    #    Document={'S3Object': {'Bucket': bucket, 'Name': document}},
    #    FeatureTypes=["TABLES", "FORMS", "SIGNATURES"])

    ### Uncomment to analyze a local file ###
    # with open("pathToFile", 'rb') as img_file:
        ### To display image using PIL ###
    #    image = Image.open()
        ### Read bytes ###
    #    img_bytes = img_file.read()
    #    response = client.analyze_document(Document={'Bytes': img_bytes}, FeatureTypes=["TABLES", "FORMS", "SIGNATURES"])
    
    #me:save response in json file
    # f = open("sampleresponse_textract.json", "w")
    # json.dump(response,f)
    
    #Get the text blocks
    # blocks=response['Blocks']
    # width, height =image.size    
    # print ('Detected Document Text')
   
    # # Create image showing bounding box/polygon the detected lines/text
    # for block in blocks:
    #     DisplayBlockInformation(block)    
    #     draw=ImageDraw.Draw(image)

    #     # Draw bounding boxes for different detected response objects
    #     if block['BlockType'] == "KEY_VALUE_SET":
    #         if block['EntityTypes'][0] == "KEY":
    #             ShowBoundingBox(draw, block['Geometry']['BoundingBox'],width,height,'red')
    #         else:
    #             ShowBoundingBox(draw, block['Geometry']['BoundingBox'],width,height,'green')             
    #     if block['BlockType'] == 'TABLE':
    #         ShowBoundingBox(draw, block['Geometry']['BoundingBox'],width,height, 'blue')
    #     if block['BlockType'] == 'CELL':
    #         ShowBoundingBox(draw, block['Geometry']['BoundingBox'],width,height, 'yellow')
    #     if block['BlockType'] == 'SELECTION_ELEMENT':
    #         if block['SelectionStatus'] =='SELECTED':
    #             ShowSelectedElement(draw, block['Geometry']['BoundingBox'],width,height, 'blue')    
            
    # # Display the image
    # image.show()
    # image.save('image1.png')
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
        print(validator.ValidateAWB(awbcandidate))
        if validator.ValidateAWB(awbcandidate)['valid']:
            awbcandidates.append(awbcandidate)
                
    # Validate awb candidates
    # for awbcandidate in awbcandidates:
    return awbcandidates
        
# INPUT:
# imageID (image name in bucket)
# OUTPUT:
# AWB which is validated

def searchAWBbyOCR(imageID):
    session = boto3.Session()
    s3_connection = session.resource('s3')
    client = session.client('textract', region_name='ap-southeast-1')
    bucket = "cathayhackathonimage"
    # document = "WhatsApp Image 2024-11-06 at 17.13.09.jpeg"
    document = imageID
    result=process_text_analysis(s3_connection, client, bucket, document)
    validAWB = filter_non_awb(result)
    print(validAWB)
    return validAWB


