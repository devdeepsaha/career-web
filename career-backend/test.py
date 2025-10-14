import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg.set_content("Hello, this is a test.")
msg['Subject'] = "Test Email"
msg['From'] = "994987001@smtp-brevo.com"
msg['To'] = "devdeep120205@gmail.com"

with smtplib.SMTP("smtp-relay.brevo.com", 587) as server:
    server.starttls()
    server.login("994987001@smtp-brevo.com", "3SvmQXEjWKF5HpAJ")
    server.send_message(msg)

print("Email sent!")
