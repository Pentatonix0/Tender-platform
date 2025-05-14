from flask import Flask, request, jsonify, make_response
from flask_restx import Api, Resource, Namespace, fields
from datetime import timedelta, datetime
from application.services.db_service import UserDBService
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required,
                                create_refresh_token, get_jwt_identity)


class UserService:

    @staticmethod
    def is_user_admin(username):
        return UserDBService.check_is_admin_by_username(username)

    @staticmethod
    def get_users_company_names(order_id):
        try:
            print(order_id)
            companies = UserDBService.get_users_company_names_by_order_id(order_id)
            response_object = {
                'status': 'success',
                'response': companies
            }
            return response_object
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object

    @staticmethod
    def get_all_users():
        try:
            db_users = UserDBService.get_all_users()
            return db_users
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def delete_user(username):
        try:
            UserDBService.delete_user(username)
            response_object = {
                'status': 'success',
                'message': 'User successfully deleted'
            }
            return response_object, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'try again'
            }
            return response_object, 400
