with open("apps/backend/app/services/notification_scheduler.py", "r") as f:
    content = f.read()

content = content.replace("import random\n\n\n\nasync def _send_in_batches", "async def _send_in_batches")

with open("apps/backend/app/services/notification_scheduler.py", "w") as f:
    f.write(content)
