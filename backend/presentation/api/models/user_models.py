from flask_restx import Namespace, fields


class UserDTO:
    namespace = Namespace("users", description="A namespace for user information")

    user_model = namespace.model(
        'User',
        {
            "id": fields.Integer(),
            "username": fields.String(),
            "company": fields.String(),
            "email": fields.String()
        }
    )
