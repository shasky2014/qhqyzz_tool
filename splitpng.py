from PIL import Image
import numpy as np
import os
import cv2


def find_objects_by_contours(image_path, output_dir="extracted_objects/"):
    os.makedirs(output_dir, exist_ok=True)
    
    # 读取图像
    img = Image.open(image_path).convert('RGBA')
    img_array = np.array(img)
    
    # 分离 RGB 和 Alpha 通道
    rgb_channels = img_array[:, :, :3]
    alpha_channel = img_array[:, :, 3]
    
    # 创建掩码：非透明区域
    mask = alpha_channel > 0
    
    # 转换为 OpenCV 格式
    gray = cv2.cvtColor(rgb_channels, cv2.COLOR_RGB2GRAY)
    
    # 使用轮廓检测
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"检测到 {len(contours)} 个对象")
    
    objects = []
    for i, contour in enumerate(contours):
        # 获取包围矩形
        x, y, w, h = cv2.boundingRect(contour)
        
        # 裁剪对象
        obj_region = img.crop((x, y, x + w, y + h))
        
        # 保存对象
        output_path = os.path.join(output_dir, f"object_{i:03d}.png")
        obj_region.save(output_path)
        print(f"保存对象 {i}: {output_path}, 尺寸: {w}x{h}")
        
        objects.append({
            'bbox': (x, y, w, h),
            'image': obj_region,
            'area': w * h
        })
    
    return objects

def analyze_spritesheet_with_contours(spritesheet_path):
    # 分析图像基本信息
    img = Image.open(spritesheet_path)
    width, height = img.size
    print(f"精灵图尺寸: {width} x {height}")
    
    # 检测并提取对象
    objects = find_objects_by_contours(spritesheet_path)
    
    # 按面积排序（可选）
    objects.sort(key=lambda x: x['area'], reverse=True)
    
    print(f"\n检测到 {len(objects)} 个对象:")
    for i, obj in enumerate(objects):
        x, y, w, h = obj['bbox']
        print(f"  对象 {i}: 位置({x},{y}), 尺寸({w}x{h}), 面积: {obj['area']}")


if __name__ == "__main__":
    analyze_spritesheet_with_contours("card.png")
    analyze_spritesheet_with_contours("extracted_objects/seal_l3_06.png")
    
