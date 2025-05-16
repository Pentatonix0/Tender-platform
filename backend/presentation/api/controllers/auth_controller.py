from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restx import Resource
from ..models.auth_models import AuthDTO
from application.services.auth_service import AuthService

auth_ns = AuthDTO.namespace
login_model = AuthDTO.login_model
signup_model = AuthDTO.signup_model
user_model = AuthDTO.user_model


@auth_ns.route('/signup')
class SingUp(Resource):
    @auth_ns.expect(signup_model)
    def post(self):
        data = request.json
        return AuthService.sign_up(data)


@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.json
        return AuthService.login(data)


@auth_ns.route('/refresh')
class Refresh(Resource):
    def post(self):
        return dict(), 501

@auth_ns.route("/validate_user")
class ValidateUser(Resource):
    @jwt_required()
    def get(self):
        try:
            username = get_jwt_identity()
            is_valid = AuthService.validate_user(username)
            return {"is_valid": is_valid}, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500




