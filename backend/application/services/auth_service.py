from datetime import timedelta, datetime
from application.services.db_service import UserDBService
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token


class AuthService:
    @staticmethod
    def login(data):
        try:
            username = data.get('username')
            password = data.get('password')
            db_user = UserDBService.get_user_by_username(username)

            if db_user and check_password_hash(db_user.password, password):
                access_token = create_access_token(
                    identity=db_user.username, expires_delta=timedelta(weeks=1000))
                refresh_token = create_refresh_token(
                    identity=db_user.username, expires_delta=timedelta(weeks=1000))
                role = db_user.role
                responce_object = {"access_token": access_token, "refresh_token": refresh_token, "user_id": db_user.id,
                                   "role": role}
                return responce_object, 200
            else:
                response_object = {
                    'status': 'fail',
                    'message': 'Wrong Login or Password'
                }
                return response_object, 401
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def sign_up(data):
        try:
            username = data.get('username')

            db_user = UserDBService.get_user_by_username(username)

            if db_user is not None:
                response_object = {"message": f"User with username {username} already exists"}
                return response_object, 400
            print(data)
            email = data.get('email')
            company = data.get("company")
            password = generate_password_hash(data.get('password'))
            role = "user"
            registration_date = datetime.now()
            print(email)
            user = UserDBService.create_user(username, email, company, password,
                                             role, registration_date)

            access_token = create_access_token(identity=user.username, expires_delta=timedelta(weeks=1000))
            refresh_token = create_refresh_token(identity=user.username, expires_delta=timedelta(weeks=1000))
            response_object = {"access_token": access_token, "refresh_token": refresh_token, "role": user.role,
                               "user_id": user.id}
            return response_object, 201

        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500
