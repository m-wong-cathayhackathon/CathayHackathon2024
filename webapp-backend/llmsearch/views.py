from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, JSONParser

from llmsearch import awsutils

class LLMSearchView(APIView):
    
    def post(self, request, *args, **kwargs):
        data = request.data
        query = data.get('query')
        dimensions = data.get('dimensions')

        if not query and not dimensions:
            return JsonResponse({'error': 'Any field is required!'}, status=400)
        
        if query is None:
            query = ""
            
        if dimensions is None:
            dimensions = ""

        return JsonResponse({
            "data": awsutils.semantic_search(query, dimensions)
        })