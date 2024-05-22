i = 0
a = 1845*10**358+3
while i < 1845*10**365:
    i += 1

    if a == 1:
        break
    if (a % 2) == 1:
        print(a, i, 'a*3+1')
        a = a*3+1
    else:
        print(a, i, 'a//2')
        a = a//2
print(a, i, 'a//2')
