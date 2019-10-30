import os;
import time; 
import datetime;
 


for i in range(5):
    ticks = int(time.time())

    f1 = open('/Users/wangjinhu/Project/eps-serverless/jinhuchange.js','r+')
    infos = f1.readlines()
    f1.seek(0,0)
    f1.write("Change Time:"+time.strftime("%Y-%m-%d %H:%M", time.localtime(ticks)))
    f1.close()


    time.sleep(1)

    os.system("git add .")


    os.system("git commit -m 'updte' ")


    os.system("git push origin master")

