testArr = [1, 2, 3, 4]

try:
    print(testArr[6])
except IndexError as err:
    print(err)
    print("end.")