import zipfile
import json

xmind_path = r"e:\Project\Personal\cust360web\CRM CUSTOMER 360 - Tính Năng Phiên Bản 5.0.xmind"
try:
    with zipfile.ZipFile(xmind_path, 'r') as z:
        files = z.namelist()
        print("Files in XMind:", files)
        if 'content.json' in files:
            content = json.load(z.open('content.json'))
            with open(r"e:\Project\Personal\cust360web\xmind_content.json", "w", encoding="utf-8") as f:
                json.dump(content, f, ensure_ascii=False, indent=2)
            print("Successfully extracted content.json to xmind_content.json")
        else:
            print("content.json not found in XMind file.")
except Exception as e:
    print("Error:", e)
