from flask import request
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
class RefreshResourse(Resource):
    def post(self):
        return dict(), 501
