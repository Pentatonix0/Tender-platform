from application.db_models.models import *
from werkzeug.security import generate_password_hash
from datetime import datetime


class PrimaryInitializationDBService:
    @staticmethod
    def init(username, email, company, password):
        UserDBService.create_user(username, email, company,
                                  generate_password_hash(password), "admin", datetime.now())

        statuses = [
            # Client-side general statuses
            {"status_code": 100, "status_message": "new order"},
            {"status_code": 101, "status_message": "participating, open to editing"},
            {"status_code": 102, "status_message": "participating, close to editing"},
            {"status_code": 103, "status_message": "bidding, open to editing"},
            {"status_code": 104, "status_message": "participating in bidding, open to editing"},
            {"status_code": 105, "status_message": "have not participated in bidding, close to editing"},
            {"status_code": 106, "status_message": "have participated in bidding, close to editing"},
            {"status_code": 107, "status_message": "personal orders created"},
            {"status_code": 111, "status_message": "suspended from the order"},

            # Admin-side statuses
            {"status_code": 200, "status_message": "order created, active"},
            {"status_code": 203, "status_message": "bidding"},
            {"status_code": 205, "status_message": "finished, personal orders created"},
            {"status_code": 207, "status_message": "archived"},

            # Client-side personal statuses
            {"status_code": 300, "status_message": "personal order created"},
            {"status_code": 305, "status_message": "personal order done"},
        ]

        for status in statuses:
            status_code = status["status_code"]
            status_message = status["status_message"]
            StatusDBService.create_status(status_code, status_message)

    @staticmethod
    def is_initialized():
        status = InitializationStatus.query.first()
        return status

    @staticmethod
    def initialization_done():
        status = InitializationStatus(is_initialized=True)
        status.save()


class UserDBService:
    @staticmethod
    def get_user_by_username(username):
        user = User.query.filter_by(username=username).first()
        return user

    @staticmethod
    def get_user_by_company(company):
        user = User.query.filter_by(company=company).first()
        return user

    @staticmethod
    def get_user_by_id(user_id):
        user = User.query.filter_by(id=user_id).first()
        return user

    @staticmethod
    def get_all_users():
        users = User.query.filter(User.role != "admin").all()
        return users

    @staticmethod
    def create_user(username, email, company, password, role, registration_date):
        user = User(username=username, email=email, company=company, password=password, role=role,
                    registration_date=registration_date)
        user.save()
        return user

    @staticmethod
    def check_username_id(username, user_id):
        user = User.query.filter_by(username=username).first()
        print(username, user, user_id)
        return user.id == user_id

    @staticmethod
    def check_is_admin(user_id):
        user = User.query.filter_by(id=user_id).first()
        return user.role == "admin"

    @staticmethod
    def check_is_admin_by_username(username):
        user = User.query.filter_by(username=username).first()
        return user.role == "admin"

    @staticmethod
    def get_users_company_names_by_order_id(order_id):
        order = Order.query.filter_by(id=order_id).first()
        participants = order.participants
        companies = [{'user_id': participant.user.id, "company_name": participant.user.company} for participant in
                     participants]
        return companies

    @staticmethod
    def delete_user(username):
        user = User.query.filter_by(username=username).first()
        if user.role != "admin":
            user.delete()
        else:
            raise


class OrderDBService:
    @staticmethod
    def create_order(title, description, permitted_providers, status_id, publishing_date):
        order = Order(title=title, description=description, permitted_providers=permitted_providers, status_id=status_id,
                      publishing_date=publishing_date)
        order.save()
        return order

    @staticmethod
    def delete_order(order_id):
        order = Order.query.filter_by(id=order_id).first()
        order.delete()

    @staticmethod
    def get_all_orders():
        orders = Order.query.all()
        return orders

    @staticmethod
    def get_all_bidding_orders():
        status = Status.query.filter_by(code=203).first()
        orders = status.orders
        return orders

    @staticmethod
    def get_order_by_id(order_id):
        order = Order.query.filter_by(id=order_id).first()
        return order

    @staticmethod
    def get_all_participation(username):
        user = User.query.filter_by(username=username).first()
        return sorted(user.participants, key=lambda x: x.order.publishing_date, reverse=True)

    @staticmethod
    def update_order_meta(order_id, title, description):
        order = Order.query.filter_by(id=order_id).first()
        order.title = title
        order.description = description
        order.save()
        return order

    @staticmethod
    def set_order_status(order, status):
        order.status = status
        order.save()
        return order

    @staticmethod
    def set_deadline(order, deadline):
        order.deadline = deadline
        order.save()
        return order


class ItemDBService:
    @staticmethod
    def create_item(item_name):
        item = Item(name=item_name)
        item.save()
        return item

    @staticmethod
    def get_item_by_id(item_id):
        item = Item.query.filter_by(id=item_id).first()
        return item

    @staticmethod
    def get_item_by_name(item_name):
        item = Item.query.filter_by(name=item_name).first()
        return item


class OrderItemDBService:
    @staticmethod
    def create_order_item(order_id, item_id, amount):
        order_item = OrderItem(order_id=order_id, item_id=item_id, amount=amount)
        order_item.save()
        return order_item

    @staticmethod
    def get_all_order_items(order_id):
        order = OrderDBService.get_order_by_id(order_id)
        return order.order_items

    @staticmethod
    def set_recommended_price(order_item_id, price):
        order_item = OrderItem.query.filter_by(id=order_item_id).first()
        order_item.recommended_price = price
        order_item.save()


class OrderParticipantDBService:
    @staticmethod
    def create_order_participant(order_id, user_id, status_id):
        order_participant = OrderParticipant(order_id=order_id, user_id=user_id, status_id=status_id)
        order_participant.save()
        return order_participant

    @staticmethod
    def get_participant(username, order_id):
        user = UserDBService.get_user_by_username(username)
        return next((prt for prt in user.participants if prt.order_id == order_id), None)

    @staticmethod
    def get_participant_by_id(participant_id):
        participant = OrderParticipant.query.filter_by(id=participant_id).first()
        return participant

    @staticmethod
    def update_participant_status(participant, status_id):
        participant.status_id = status_id
        participant.save()
        return participant

    @staticmethod
    def set_participant_status_id(participant, status_id):
        participant.status_id = status_id
        participant.save()

    @staticmethod
    def set_participant_deadline(participant, deadline):
        participant.deadline = deadline
        participant.save()


class OrderParticipantPriceDBService:
    @staticmethod
    def create_order_participant_price(order_participant_id, order_item_id, price, comment=None,
                                       last_participant_status_id=None):
        order_participant_price = OrderParticipantPrice(order_participant_id=order_participant_id,
                                                        order_item_id=order_item_id,
                                                        price=price,
                                                        comment=comment,
                                                        last_participant_status_id=last_participant_status_id)
        order_participant_price.save()
        return order_participant_price


class OrderParticipantLastPriceDBService:
    @staticmethod
    def create_order_participant_last_price(order_participant_id, price_id, order_item_id):
        order_participant_last_price = OrderParticipantLastPrice(order_participant_id=order_participant_id,
                                                                 price_id=price_id, order_item_id=order_item_id)
        order_participant_last_price.save()
        return order_participant_last_price

    @staticmethod
    def update_last_price_price_id(last_price, new_price_id):
        last_price.price_id = new_price_id
        last_price.save()

    @staticmethod
    def set_is_the_best_price(last_price, value):
        last_price.is_the_best_price = value
        last_price.save()


class StatusDBService:
    @staticmethod
    def create_status(status_code, status_message):
        status = Status(code=status_code, message=status_message)
        status.save()
        return status

    @staticmethod
    def get_status_by_status_code(status_code):
        status = Status.query.filter_by(code=status_code).first()
        return status


class PersonalOrderDBService:
    @staticmethod
    def create_personal_order(user_id, order_id, is_empty):
        personal_order = PersonalOrder(user_id=user_id, order_id=order_id, is_empty=is_empty)
        personal_order.save()
        return personal_order

    @staticmethod
    def get_personal_orders(order_id):
        personal_orders = PersonalOrder.query.filter_by(order_id=order_id).all()
        return personal_orders

    @staticmethod
    def get_personal_orders_by_id(personal_order_id):
        personal_order = PersonalOrder.query.filter_by(id=personal_order_id).first()
        return personal_order


class PersonalOrderPositionDBService:
    @staticmethod
    def create_personal_order_position(personal_order_id, price_id):
        personal_order_position = PersonalOrderPosition(personal_order_id=personal_order_id, price_id=price_id)
        personal_order_position.save()
        return personal_order_position
