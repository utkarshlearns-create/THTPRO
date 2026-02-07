from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.conf import settings
import jwt
import datetime
from django.utils import timezone

class DebugTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({"error": "No Bearer token found"}, status=400)
        
        token = auth_header.split(' ')[1]
        
        report = {
            "server_time_utc": str(timezone.now()),
            "secret_key_hash": str(hash(settings.SECRET_KEY)), # Don't reveal key, just hash
            "token_received": token[:10] + "..." + token[-5:],
        }
        
        # 1. Decode without verification
        try:
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            report["unverified_payload"] = unverified_payload
            
            # Check expiration manually
            exp = unverified_payload.get('exp')
            if exp:
                exp_dt = datetime.datetime.fromtimestamp(exp, tz=datetime.timezone.utc)
                report["token_exp_time"] = str(exp_dt)
                report["is_expired_by_server_clock"] = timezone.now() > exp_dt
                
        except Exception as e:
            report["docode_error"] = str(e)
            return Response(report)

        # 2. Verify Signature
        try:
            jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            report["signature_valid"] = True
            report["status"] = "Valid"
        except jwt.ExpiredSignatureError:
            report["signature_valid"] = True
            report["status"] = "ExpiredSignatureError"
        except jwt.InvalidSignatureError:
            report["signature_valid"] = False
            report["status"] = "InvalidSignatureError - SECRET_KEY MISMATCH"
        except Exception as e:
             report["validation_error"] = str(e)
             report["status"] = "Invalid"

        return Response(report)
