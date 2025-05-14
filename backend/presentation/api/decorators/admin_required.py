from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import abort
from application.services.users_service import UserService


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        username = get_jwt_identity()
        if not UserService.is_user_admin(username):
            abort(403, description="Access denied. Admins only.")
        return fn(*args, **kwargs)

    return wrapper
