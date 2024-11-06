from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, JSONParser

from awb import validator, awbextractor

class AWBValidatorView(APIView):
    parser_classes = [MultiPartParser, JSONParser]

    # File upload handling
    def get(self, request, *args, **kwargs):
        if 'img' not in request.FILES:
            return JsonResponse({'error': 'There is no img attribute in the form!'}, status=400)
        
        file1 = request.FILES['img']
        
        # Translate POST image to PIL's image
        # try:
        #     pillow_image = Image.open(file1)
        # except IOError:
        #     return JsonResponse({'error': 'Invalid image format!'}, status=400)
        valid_awbs = awbextractor.searchAWBbyOCRimagebinary(file1.file.read())

        return JsonResponse({'data': valid_awbs})

    # Validate AWB number
    def post(self, request, *args, **kwargs):
        data = request.data
        waybill_number = data.get('awb')

        if not waybill_number:
            return JsonResponse({'error': 'AWB number is required!'}, status=400)

        return JsonResponse(validator.validate_awb(waybill_number))