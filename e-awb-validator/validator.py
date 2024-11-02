import re


# Takes 11 digit Air Waybill as input
# Acceptable Input:
# 123-12345679
# 12312345679
# Any unintelligible character should be replaced with 'X', As example:
# 123-14X21415 
# 
# Return JSON object with the below format
# {
# 	"valid" : False,
# 	"reason" : "Serial number (1231231) and check digit (2) mismatch!"
# 	"suggestions" : ["123-12312311"]
# }
# 
# {
# 	"valid": True,
# 	"reason": ""
#   "suggestions" : []
# }
# 
# Check format
# Check if check digit is matching
def ValidateAWB(waybillNumber:str):
    waybillNumber = waybillNumber.strip()
    airlinePrefix = -1
    serialNumber = -1
    checkDigit = -1
    
    regex1 = re.search(r'(\d{3})-(\d{7})(\d)',waybillNumber) # Format 123-12345679
    regex2 = re.search(r'(\d{3})(\d{7})(\d)',waybillNumber)  # Format 12312345679
    # Check if waybill number match regex
    if regex1 != None or regex2 != None:
        airlinePrefix = int(regex1.group(1)) if regex1 != None else int(regex2.group(1))
        serialNumber = int(regex1.group(2)) if regex1 != None else int(regex2.group(2))
        checkDigit = int(regex1.group(3)) if regex1 != None else int(regex2.group(3))
    else:
        # Waybill Number failed both regex
        # return dict(valid=False,reason=f"Wrong Format! (input:{waybillNumber})")
        
        # See if waybill number is suggestable
        regex1 = re.search(r'([X\d]{3})-([X\d]{7})([X\d])',waybillNumber)
        regex2 = re.search(r'([X\d]{3})([X\d]{7})([X\d])',waybillNumber)
        # Not any acceptable input
        if regex1 == None and regex2 == None:
            return dict(value=False,
                        reason=f"Wrong Format {waybillNumber}",
                        suggestions=[])
        airlinePrefixStr = regex1.group(1) if regex1 != None else regex2.group(1)
        serialNumberStr = regex1.group(2) if regex1 != None else regex2.group(2)
        checkDigitStr = regex1.group(3) if regex1 != None else regex2.group(3)
        
        # Airline prefix cannot be fixed since check digit does not apply to first 3 digits
        if 'X' in airlinePrefixStr:
            return dict(value=False,
                        reason=f"Invalid Airline Prefix {airlinePrefixStr} (First 3 characters)",
                        suggestions=[])
        # Serial number can be fixed if only 1 digit is missing and check digit is not missing
        if 'X' in serialNumberStr and serialNumberStr.count('X')==1 and 'X' not in checkDigitStr:
            suggestions = []
            for i in range(10):
                testSerialNumberStr = serialNumberStr.replace('X',str(i))
                if(int(testSerialNumberStr)%7==int(checkDigitStr)):
                    suggestions.append(f'{airlinePrefixStr}-{testSerialNumberStr}{checkDigitStr}')
            return dict(value=False,
                        reason=f"Invalid serial number {serialNumberStr} (7 characters after the first 3)",
                        suggestions=suggestions)
        # Check digit missing, serial number are not missing
        if 'X' in checkDigitStr and 'X' not in serialNumberStr:
            missingCheckDigit = int(serialNumberStr)%7
            suggestions = [f"{airlinePrefixStr}-{serialNumberStr}{missingCheckDigit}"]
            return dict(value=False,
                        reason=f"Invalid check digit {checkDigitStr} (Last character)",
                        suggestions=suggestions)
        # Correct format input for unintelligible, but no suggestions
        return dict(value=False,
                    reason=f"Invalid waybill number {waybillNumber}",
                    suggestions=[])
            
    
    # Checks check digit if serial number is correct
    if serialNumber%7 != checkDigit:
        return dict(valid=False,
                    reason=f"Serial number ({serialNumber}) and check digit ({checkDigit}) mismatch!",
                    suggestions=[])
    
    return dict(valid=True,
                reason="",
                suggestions=[])
    
    
testcases = [
    "123-12312312",
    "123-12312311",
    "12312312312",
    "12312312311",
	"12X-12312312",
    "456-12X12311",
    "123-1231231X",
    "12X12312312",
    "12312X12312",
    "1231231231X",
    "12--12312312",
    "123-000000X1",
    "123-14184X9X"
]
for testcase in testcases:
    print(f"Testing:{testcase}\n{ValidateAWB(testcase)}")
    print(str("abcdefg").count('h'))
    # print(re.search(r'(\d{3})-(\d{7})(\d)',testcase).group(1))