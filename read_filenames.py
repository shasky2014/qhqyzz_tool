import os
# print(list(range(1, 5)))
print("{"   )
for i in range(1, 5):
    print('    "lv%d":{' % i)
    filelist= sorted(os.listdir('./lv%d/' % i))
    for f in filelist:
        if f==".DS_Store":
            continue
        print(' '*7, 
              '"{n}":{{\n{b}"name":"",\n{b}"description":""\n{b}}}'.format(n=f,b=' '*24),
              "" if (f==filelist[-1]) else ",")
    print("    }" if (i==4) else "    },")
print("}")
