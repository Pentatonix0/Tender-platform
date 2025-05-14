from flask_restx import Namespace, fields
from presentation.api.models.user_models import UserDTO


class OrderDTO:
    namespace = Namespace('order', description="A namespace for orders")

    status_model = namespace.model(
        "Status",
        {
            "id": fields.Integer(),
            "code": fields.Integer(),
            "message": fields.String()
        }
    )

    item_model = namespace.model(
        "Item",
        {
            "id": fields.Integer(),
            "name": fields.String()
        }
    )

    order_item_model = namespace.model(
        "OrderItem",
        {
            "id": fields.Integer(),
            "item": fields.Nested(item_model),
            "amount": fields.Integer(),
            "recommended_price": fields.Integer()
        }
    )

    order_model = namespace.model(
        "AdminOrder",
        {
            "id": fields.Integer(),
            "title": fields.String(),
            "description": fields.String(),
            "status": fields.Nested(status_model),
            "publishing_date": fields.DateTime(),
            "permitted_providers": fields.List(fields.Integer()),
            "order_items": fields.List(fields.Nested(order_item_model))
        }
    )

    order_preview_model = namespace.model(
        "OrderPreview",
        {
            "id": fields.Integer(),
            "title": fields.String(),
            "description": fields.String(),
            "status": fields.Nested(status_model),
            "deadline": fields.DateTime()
        }
    )

    order_participant_preview_model = namespace.model(
        "UserOrder",
        {
            "id": fields.Integer(),
            "user_id": fields.Integer(),
            "order_id": fields.Integer(),
            "status": fields.Nested(status_model),
            "order": fields.Nested(order_preview_model),
            "deadline": fields.DateTime()
        }
    )

    order_participant_status_model = namespace.model(
        "ParticipantStatus",
        {
            "id": fields.Integer(),
            "user_id": fields.Integer(),
            "order_id": fields.Integer(),
            "user": fields.Nested(UserDTO.user_model),
            "status": fields.Nested(status_model),
            "deadline": fields.DateTime()

        }
    )

    order_participant_price_model = namespace.model(
        "Price",
        {
            "order_item": fields.Nested(order_item_model),
            "price": fields.Fixed(decimals=2),
            "comment": fields.String()
        }
    )

    order_participant_last_price_model = namespace.model(
        "LastPrice",
        {
            "price": fields.Nested(order_participant_price_model),
            "is_the_best_price": fields.Boolean()
        }
    )

    order_participant_model = namespace.model(
        "Participant",
        {
            "id": fields.Integer(),
            "order": fields.Nested(order_preview_model),
            "status": fields.Nested(status_model),
            "last_prices": fields.Nested(order_participant_last_price_model),
            "deadline": fields.DateTime()
        }
    )

    admin_order_model = namespace.model(
        "AdminOrder",
        {
            "id": fields.Integer(),
            "title": fields.String(),
            "description": fields.String(),
            "status": fields.Nested(status_model),
            "publishing_date": fields.DateTime(),
            "permitted_providers": fields.List(fields.Integer()),
            "participants": fields.List(fields.Nested(order_participant_status_model)),
            "order_items": fields.List(fields.Nested(order_item_model)),
            "deadline": fields.DateTime()
        }
    )

    personal_order_model = namespace.model(
        "PersonalOrder",
        {
            "id": fields.Integer(),
            "user": fields.Nested(UserDTO.user_model),
            "order": fields.Nested(order_preview_model),
            "is_empty": fields.Boolean()
        }
    )
