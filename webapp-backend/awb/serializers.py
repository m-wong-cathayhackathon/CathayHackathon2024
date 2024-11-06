from rest_framework import serializers

class EmptyClass():
    pass

class EmptyBodySerializer(serializers.ModelSerializer):
     class Meta:
        model = EmptyClass
        fields = '__all__'