import os
import subprocess
from urllib.parse import urljoin


def  download_png(base_url='https://game.maj-soul.com/1/v0.11.172.w/res/atlas/myres/amulet/',
                  png_name='card.png',
                  root_path='fu_png/'):
    """
    默认参数下载card.png
    """  
    full_url = base_url + png_name  
    try:
        # 使用 subprocess.call 执行命令
        result = subprocess.run([
            'curl', 
            full_url, 
            '--output', 
            root_path+png_name
        ], check=True, capture_output=True, text=True)
        print(f"成功下载: {png_name}")
    except subprocess.CalledProcessError as e:
        print(f"下载失败: {png_name}, 错误: {e.stderr}")


base_url = "https://game.maj-soul.com/1/v0.11.172.w/lang/base/myres/amulet/effect/"
pngroot_path='fu_png/'
for i in range(1, 195):
    png_name='fu_{0:04d}.png'.format(i)
    download_png(base_url,png_name,pngroot_path)

download_png()

