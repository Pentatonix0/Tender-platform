from flask_restx import Namespace, fields


class AuthDTO:
    namespace = Namespace('auth', description="A namespace for authentification")
    signup_model = namespace.model(
        'SignUp',
        {
            "username": fields.String(),
            "email": fields.String(),
            "company": fields.String(),
            "password": fields.String()

        }
    )

    login_model = namespace.model(
        'Login',
        {
            "username": fields.String(),
            "password": fields.String()

        }
    )

    user_model = namespace.model(
        'User',
        {
            "id": fields.Integer(),
            "username": fields.String(),
            "company": fields.String()
        }
    )
