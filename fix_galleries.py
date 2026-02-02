#!/usr/bin/env python3
import re

commercial_html = open('/home/agent/avir/site/galleries/commercial/index.html', 'r').read()
alt_pattern = r'<img src="" loading="lazy" alt="Bighorn (\d+)"'

def replace_commercial_src(match):
    num = int(match.group(1))
    return f'<img src="/images/galleries/commercial/asset_{num}.jpeg" loading="lazy" alt="Bighorn {num}"'

commercial_html = re.sub(alt_pattern, replace_commercial_src, commercial_html)
json_pattern = r'"url": "",\s*"type": "image"'

commercial_count = 0
def replace_json_url(match):
    global commercial_count
    commercial_count += 1
    return f'"url": "/images/galleries/commercial/asset_{commercial_count}.jpeg",\n      "type": "image"'

commercial_html = re.sub(json_pattern, replace_json_url, commercial_html)

with open('/home/agent/avir/site/galleries/commercial/index.html', 'w') as f:
    f.write(commercial_html)

print(f"Fixed commercial gallery - {commercial_count} images")

lifestyle_html = open('/home/agent/avir/site/galleries/lifestyle/index.html', 'r').read()
lifestyle_mapping = {1: 21, 2: 22, 3: 23, 4: 24, 5: 25, 6: 26, 7: 27, 8: 29, 9: 28, 10: 36, 11: 35, 12: 34, 13: 37, 14: 38, 15: 39, 21: 7, 22: 8, 23: 9, 24: 11}
alt_pattern_lifestyle = r'<img src="" loading="lazy" alt="Lifestyle (\d+)"'

def replace_lifestyle_src(match):
    num = int(match.group(1))
    asset_num = lifestyle_mapping.get(num, num)
    return f'<img src="/images/galleries/lifestyle/asset_{asset_num}.jpeg" loading="lazy" alt="Lifestyle {num}"'

lifestyle_html = re.sub(alt_pattern_lifestyle, replace_lifestyle_src, lifestyle_html)

lifestyle_count = 0
lifestyle_nums = [21, 22, 23, 24, 25, 26, 27, 29, 28, 36, 35, 34, 37, 38, 39, 7, 8, 9, 11, 12, 13, 14]

def replace_lifestyle_json(match):
    global lifestyle_count
    lifestyle_count += 1
    if lifestyle_count <= len(lifestyle_nums):
        asset_num = lifestyle_nums[lifestyle_count - 1]
        return f'"url": "/images/galleries/lifestyle/asset_{asset_num}.jpeg",\n      "type": "image"'
    return match.group(0)

lifestyle_html = re.sub(json_pattern, replace_lifestyle_json, lifestyle_html)

with open('/home/agent/avir/site/galleries/lifestyle/index.html', 'w') as f:
    f.write(lifestyle_html)

print(f"Fixed lifestyle gallery - {lifestyle_count} images")

homecinema_html = open('/home/agent/avir/site/galleries/home-cinema/index.html', 'r').read()
homecinema_mapping = {1: ('1', 'jpg'), 2: ('2', 'jpg'), 3: ('3', 'jpg'), 4: ('4', 'jpeg'), 5: ('5', 'jpeg'), 6: ('6', 'jpeg'), 7: ('7', 'jpeg'), 8: ('8', 'jpeg'), 9: ('9', 'jpg'), 10: ('10', 'png'), 11: ('11', 'jpeg'), 12: ('12', 'jpeg'), 13: ('13', 'jpeg'), 14: ('14', 'jpeg'), 15: ('15', 'jpeg')}
alt_pattern_cinema = r'<img src="" loading="lazy" alt="([^"]+)"'

cinema_count = 0
def replace_cinema_src(match):
    global cinema_count
    cinema_count += 1
    if cinema_count in homecinema_mapping:
        asset_num, ext = homecinema_mapping[cinema_count]
        alt_text = match.group(1)
        return f'<img src="/images/galleries/home-cinema/asset_{asset_num}.{ext}" loading="lazy" alt="{alt_text}"'
    return match.group(0)

homecinema_html = re.sub(alt_pattern_cinema, replace_cinema_src, homecinema_html)

cinema_json_count = 0
def replace_cinema_json(match):
    global cinema_json_count
    cinema_json_count += 1
    if cinema_json_count in homecinema_mapping:
        asset_num, ext = homecinema_mapping[cinema_json_count]
        return f'"url": "/images/galleries/home-cinema/asset_{asset_num}.{ext}",\n      "type": "image"'
    return match.group(0)

homecinema_html = re.sub(json_pattern, replace_cinema_json, homecinema_html)

with open('/home/agent/avir/site/galleries/home-cinema/index.html', 'w') as f:
    f.write(homecinema_html)

print(f"Fixed home-cinema gallery - {cinema_count} images")
print("\nAll gallery HTML files have been fixed!")
