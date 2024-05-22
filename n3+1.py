def function(a, b):
    if a == 1:
        b.append(a)
        return b
    if (a % 2) == 1:
        b.append(a)
        return function(a*3+1, b)
    else:
        b.append(a)
        return function(a//2, b)


print(function(1845*10**361, []))
