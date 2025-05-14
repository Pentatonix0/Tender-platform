from flask import request
from flask_restx import Resource
from ..models.user_models import UserDTO
from application.services.users_service import UserService
from flask_jwt_extended import jwt_required, get_jwt_identity
from presentation.api.decorators.admin_required import admin_required

users_ns = UserDTO.namespace
user_model = UserDTO.user_model


@users_ns.route('/get_all_users')
class AllUsers(Resource):
    def get(self):
        users = UserService.get_all_users()
        if not users:
            return []
        return users_ns.marshal(users, user_model)


@users_ns.route('/delete_user')
class DeleteUser(Resource):
    @users_ns.doc(params={'username': 'username of the user to delete'})
    @jwt_required()
    @admin_required
    def delete(self):
        username = request.args.get('username')

        if not username:
            return {"message": "Username is required"}, 400

        response, code = UserService.delete_user(username)

        return response, code


@users_ns.route('/change_password_admin')
class ChangePasswordAdmin(Resource):
    @users_ns.doc(params={'user_id': 'Id of the user to delete'})
    @jwt_required()
    @admin_required
    def put(self):
        try:
            user_id = request.args.get('user_id')
            if not user_id:
                return {"message": "user_id is required"}, 400
            data = request.json
            password = data.get('password')
            if not data or not password:
                return {"message": "data is undefined"}, 400
            UserService.change_password_admin(user_id, password)
            return {'status': 'success', "message": "Password successfully changed"}, 200
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 500


@users_ns.route('/companies/<int:order_id>')
class Companies(Resource):
    @jwt_required()
    @admin_required
    def get(self, order_id):
        response_object = UserService.get_users_company_names(order_id)
        if response_object['status'] == 'success':
            return response_object['response'], 200
        else:
            return response_object, 400
