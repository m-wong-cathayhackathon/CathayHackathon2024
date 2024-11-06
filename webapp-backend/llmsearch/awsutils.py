import json
import boto3
from fiveguysapi import settings
from opensearchpy import OpenSearch, RequestsHttpConnection
from sentence_transformers import SentenceTransformer, util
import numpy as np

mock_data = [
    {
        "id": "421-98765432",
        "description": "A shipment of 50 LCD monitors, model HM278, packed in individual boxes with protective foam.",
        "dimensions": "50cm x 30cm x 20cm"
    },
    {
        "id": "753-12345678",
        "description": "20 units of high-definition LED screens, model SL-4K,  for a digital signage project.",
        "dimensions": "40cm x 30cm x 10cm"
    },
    {
        "id": "298-87654321",
        "description": "100 units of laptop computer, model L15-HD, packed in bulk.",
        "dimensions": "30cm x 20cm x 5cm"
    },
    {
        "id": "105-67890123",
        "description": "A shipment of 30 plasma televisions, model PT-65X, with protective film and packaging.",
        "dimensions": "100cm x 60cm x 25cm"
    },
    {
        "id": "369-54321098",
        "description": "100 units of 24-inch mega bonk, model L24-PRO, for office use.",
        "dimensions": "55cm x 40cm x 15cm"
    },
    {
        "id": "812-76543210",
        "description": "A shipment of 50 bags of premium potato chips, model SM-55, with calibration tools.",
        "dimensions": "60cm x 45cm x 20cm"
    },
    {
        "id": "547-90123456",
        "description": "20 units of curved gaming monitors, model C27-G, with high refresh rate and response time.",
        "dimensions": "65cm x 35cm x 25cm"
    },
    {
        "id": "932-10987654",
        "description": "A shipment of 100 units of 17-inch LCD monitors, model L17-BASIC, for educational purposes.",
        "dimensions": "40cm x 30cm x 10cm"
    },
    {
        "id": "678-23456789",
        "description": "A shipment of 30 portable monitors, model PM-15, with USB-C connectivity.",
        "dimensions": "30cm x 20cm x 5cm"
    },
    {
        "id": "245-34567890",
        "description": "A shipment of 50 monitors, various models and sizes, for a retail store display.",
        "dimensions": "Various"
    },
]

model = SentenceTransformer('all-MiniLM-L6-v2')

# Extract descriptions and dimensions
descriptions = [item['description'] for item in mock_data]
dimensions = [item['dimensions'] for item in mock_data]

# Encode the descriptions and dimensions
description_embeddings = model.encode(descriptions)
dimension_embeddings = model.encode(dimensions)

# Combine embeddings
combined_embeddings = np.concatenate((description_embeddings, dimension_embeddings), axis=1)

def semantic_search(query, dimensions, k=3):
    # Encode the query description and dimensions
    query_embedding_desc = model.encode([query])
    query_embedding_dim = model.encode([dimensions])
    
    # Combine query embeddings
    query_embedding = np.concatenate((query_embedding_desc, query_embedding_dim), axis=1)
    
    # Compute cosine similarities
    similarities = util.pytorch_cos_sim(query_embedding, combined_embeddings)[0]
    
    # Get the top k results
    top_k_indices = similarities.topk(k=k).indices
    
    # Retrieve the matching objects
    results = [mock_data[i] for i in top_k_indices]
    return results


# I love when I use the AWS account provided by cathay always see the exception "User does not have permissions for the requested resource"
# Now I'm gonna comment the code and use library to mock the result instead.
def perform_aws_search(input_str: str) -> list:
    # session = boto3.Session(
    #     aws_access_key_id=settings.AWS_SERVER_PUBLIC_KEY,
    #     aws_secret_access_key=settings.AWS_SERVER_SECRET_KEY,
    # )
    # client = session.client('bedrock-runtime', region_name='ap-southeast-1')
    
    # opensearch_client = OpenSearch(
    #     hosts = [{"host": settings.AWS_OPENSEARCH_ENDPOINT, "port": 443}],
    #     http_auth = "", use_ssl = True, verify_certs = True,
    #     connection_class = RequestsHttpConnection,
    #     pool_maxsize = 10
    # )
    
    # document = {
    #     "size": 15,
    #     "_source": {"excludes": ["doc_vector"]}, # attempting to hardcode in AWS but got exception
    #     "query": {
    #         "knn": {
    #              "doc_vector": {
    #                  "vector": vector,
    #                  "k":10 # Bascially using Knn method to search
    #              }
    #         }
    #     }
    # }
    # response = opensearch_client.search(
    #     body = document,
    #     index = "doc_index1"
    # )
    return {
        "error": "AWS IS BUGGY",
    }
    
    
# def opensearch_consume_index(opensearch_client, bedrock_client, text: str):
#     body=json.dumps({"inputText": text})
#     response = bedrock_client.invoke_model(body=body, modelId='amazon.titan-embed-text-v1', accept='application/json', contentType='application/json')
#     response_body = json.loads(response.get('body').read())
#     embedding = response_body.get('embedding')
    
#     document = {
#       "doc_text": text,
#       "doc_vector": embedding,
#     }
    
#     response = opensearch_client.index(
#         index = 'doc_index1',
#         body = document
#     )