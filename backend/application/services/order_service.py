from application.services.db_service import *
from application.services.excel_service import ExcelService
from datetime import datetime, timezone
import dateutil.parser
import re


class OrderService:

    @staticmethod
    def create_order_items(order_id, order_items):
        for order_item_dict in order_items:
            order_item_name = order_item_dict["name"]
            order_item_amount = order_item_dict["amount"]
            if not ItemDBService.get_item_by_name(order_item_name):
                ItemDBService.create_item(order_item_name)
            item = ItemDBService.get_item_by_name(order_item_name)
            OrderItemDBService.create_order_item(order_id, item.id, order_item_amount)

    @staticmethod
    def create_order(data):
        try:
            title = data.get("title")
            description = data.get("description")
            order_items = data.get("order_items")
            permitted_providers = data.get("permitted_providers")
            publishing_date = datetime.now()
            order_status = StatusDBService.get_status_by_status_code(200)

            order = OrderDBService.create_order(title=title, description=description,
                                                permitted_providers=permitted_providers,
                                                status_id=order_status.id,
                                                publishing_date=publishing_date)

            OrderService.create_order_items(order.id, order_items)
            status = StatusDBService.get_status_by_status_code(100)
            for permitted_provider_id in permitted_providers:
                participant = OrderParticipantDBService.create_order_participant(order.id, permitted_provider_id,
                                                                                 status.id)
                for order_item in order.order_items:
                    price = OrderParticipantPriceDBService.create_order_participant_price(participant.id, order_item.id,
                                                                                          price=None)
                    OrderParticipantLastPriceDBService.create_order_participant_last_price(participant.id, price.id,
                                                                                           order_item.id)
            response_object = {
                'status': 'success',
                'message': 'Order successfully created'
            }
            return response_object

        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def delete_order(order_id):
        try:
            OrderDBService.delete_order(order_id)
            responce_object = {
                "status": "success",
                "message": "Order successfully deleted"
            }
            return responce_object, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def get_all_orders():
        try:
            orders = OrderDBService.get_all_orders()
            orders = sorted(orders, key=lambda x: x.publishing_date, reverse=True)
            return orders, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def get_all_user_participation(username):
        try:
            participation = [prt for prt in OrderDBService.get_all_participation(username) if
                             prt.status.code not in [111]]
            response_object = {
                "status": "success",
                "response": participation
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
    def get_all_user_open_participation(username):
        try:
            participation = [prt for prt in OrderDBService.get_all_participation(username) if
                             prt.status.code not in [111, 107]]
            response_object = {
                "status": "success",
                "response": participation
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
    def get_admin_order_content(order_id):
        try:
            order = OrderDBService.get_order_by_id(order_id)
            return order, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def get_user_order_content(username, order_id):
        participant = OrderParticipantDBService.get_participant(username, order_id)
        if participant and participant.status.code == 107:
            return {}
        return participant

    @staticmethod
    def offer_price(username, data):
        try:
            order_id = data.get("order_id")
            prices = data.get("prices")
            participant = OrderParticipantDBService.get_participant(username, order_id)
            status = participant.status
            new_code = 101
            if participant.status.code in [103, 104]:
                new_code = 104
            new_status = StatusDBService.get_status_by_status_code(new_code)
            for last_price in participant.last_prices:
                order_item_id = last_price.price.order_item_id
                price_dict = prices[str(order_item_id)]
                price = price_dict["price"]
                comment = price_dict["comment"]
                new_price = OrderParticipantPriceDBService.create_order_participant_price(participant.id, order_item_id,
                                                                                          price, comment, status.id)
                OrderParticipantLastPriceDBService.update_last_price_price_id(last_price, new_price.id)
            OrderParticipantDBService.update_participant_status(participant, new_status.id)
            response_object = {
                'status': 'success',
                'responce': {'status': 'success'}
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
    def get_current_order_state(order_id):
        order = OrderDBService.get_order_by_id(order_id)
        active_participants = [prt for prt in order.participants if prt.status.code not in [111]]
        order_items = OrderItemDBService.get_all_order_items(order_id)
        summary = {order_item.item.name: {'name': order_item.item.name, 'amount': order_item.amount} for
                   order_item in
                   order_items}

        for participant in active_participants:
            company = participant.user.company
            user_id = participant.user.id
            for last_price in participant.last_prices:
                name = last_price.price.order_item.item.name
                summary[name][company] = last_price.price.price
                summary[name][f"comment_{user_id}"] = last_price.price.comment
        print(summary)
        summary_excel = list(summary.values())
        file_stream = ExcelService.make_summary_excel(summary_excel)
        return file_stream

    @staticmethod
    def update_order_meta(order_id, data):
        try:
            title = data.get('title')
            description = data.get('description')
            OrderDBService.update_order_meta(order_id, title, description)

            responce_object = {
                "status": "success",
                "message": "Order meta updated deleted"
            }

            return responce_object, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def get_all_order_participants(order_id):
        try:
            order = OrderDBService.get_order_by_id(order_id)
            participants = [prt for prt in order.participants if prt.status.code not in [111]]
            return participants, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def start_bidding(order_id, data):
        try:
            deadline = data.get('deadline')
            deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            order = OrderDBService.get_order_by_id(order_id)
            OrderDBService.set_deadline(order, deadline)
            new_order_status = StatusDBService.get_status_by_status_code(203)
            new_participant_status = StatusDBService.get_status_by_status_code(103)
            suspended_status = StatusDBService.get_status_by_status_code(111)
            OrderDBService.set_order_status(order, new_order_status)
            items = order.order_items
            for item in items:
                last_prices = item.last_prices
                tmp = [lp for lp in last_prices if lp.price.price and lp.price.price not in [None, 0]]
                if len(tmp) > 0:
                    lowest_last_price = min(tmp, key=lambda x: x.price.price)
                    OrderParticipantLastPriceDBService.set_is_the_best_price(lowest_last_price, True)
                    recommended_price = max(round(lowest_last_price.price.price - 2), 1)
                    OrderItemDBService.set_recommended_price(item.id, recommended_price)
                    for last_price in tmp:
                        if last_price.id != lowest_last_price.id:
                            OrderParticipantLastPriceDBService.set_is_the_best_price(last_price, False)
            for participant in order.participants:
                if participant.status.code in [100, 111]:
                    OrderParticipantDBService.set_participant_status_id(participant, suspended_status.id)
                else:
                    OrderParticipantDBService.set_participant_status_id(participant, new_participant_status.id)
                    OrderParticipantDBService.set_participant_deadline(participant, deadline)

            responce_object = {
                "status": "success",
                "message": "Bidding started "
            }

            return responce_object, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def set_participant_status(username, data):
        try:
            order_id = data.get('order_id')
            status_code = data.get('status_code')
            participant = OrderParticipantDBService.get_participant(username, order_id)
            new_status = StatusDBService.get_status_by_status_code(status_code)
            print(data, username, order_id, new_status, status_code)
            OrderParticipantDBService.set_participant_status_id(participant, new_status.id)
            response_object = {
                'status': 'success',
                'message': 'Status succesfully updated'
            }
            return response_object, 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def update_participant_deadline(participant_id, data):
        try:
            deadline = data.get('deadline')
            deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            print(participant_id, deadline)
            participant = OrderParticipantDBService.get_participant_by_id(participant_id)
            new_status_code = 103
            if participant.status.code in [104, 106]:
                new_status_code = 104
            new_status = StatusDBService.get_status_by_status_code(new_status_code)
            OrderParticipantDBService.set_participant_deadline(participant, deadline)
            OrderParticipantDBService.set_participant_status_id(participant, new_status.id)
            response_object = {
                'status': 'success',
                'message': 'Participant deadline succesfully updated'
            }
            return response_object, 200

        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500

    @staticmethod
    def update_order_deadline(order_id, data):
        try:
            deadline = data.get('deadline')
            deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            order = OrderDBService.get_order_by_id(order_id)
            OrderDBService.set_deadline(order, deadline)
            participants = [prt for prt in order.participants if prt.status.code != 111]
            for prt in participants:
                new_status_code = 103
                if prt.status.code in [104, 106]:
                    new_status_code = 104
                new_status = StatusDBService.get_status_by_status_code(new_status_code)
                OrderParticipantDBService.set_participant_deadline(prt, deadline)
                OrderParticipantDBService.set_participant_status_id(prt, new_status.id)

            response_object = {
                'status': 'success',
                'message': 'Order deadline successfully updated'
            }
            return response_object, 200

        except Exception as e:
            print(e)
        response_object = {
            'status': 'fail',
            'message': 'Try again'
        }
        return response_object, 500

    @staticmethod
    def manage_deadline_status():
        try:
            print("__MANAGER_ACTIVE__")
            active_orders = OrderDBService.get_all_bidding_orders()
            now = datetime.now(timezone.utc)
            for order in active_orders:
                participants = [prt for prt in order.participants if prt.status.code not in [111]]
                for participant in participants:
                    deadline = participant.deadline
                    if deadline.tzinfo is None:  # If naive, make it UTC-aware
                        deadline = deadline.replace(tzinfo=timezone.utc)
                    if deadline <= now and participant.status.code not in [105, 106]:
                        new_status_code = 105
                        if participant.status.code == 104:
                            new_status_code = 106
                        new_status = StatusDBService.get_status_by_status_code(new_status_code)
                        OrderParticipantDBService.set_participant_status_id(participant, new_status.id)
            print("__MANAGER_DONE__")
        except Exception as e:
            print(e)

    @classmethod
    def prepare_to_personal_orders(cls, order_id):
        order = OrderDBService.get_order_by_id(order_id)
        bidding_participants = [prt for prt in order.participants if prt.status.code not in [111]]
        new_order_status = StatusDBService.get_status_by_status_code(205)
        new_participant_status = StatusDBService.get_status_by_status_code(107)
        OrderDBService.set_order_status(order, new_order_status)
        for participant in bidding_participants:
            OrderParticipantDBService.set_participant_status_id(participant, new_participant_status.id)

    @staticmethod
    def create_personal_orders(order_id, file):
        summary = ExcelService.from_summary(file)
        order = OrderDBService.get_order_by_id(order_id)
        bidding_participants = [prt for prt in order.participants if prt.status.code not in [111]]
        item_prices_dict = {order_item.item.name: order_item.last_prices for order_item in order.order_items}
        valid_pattern = r'^\d+(\.\d+)?(\\i|\\p)?$'
        personal_orders_dict = {prt.user.company: list() for prt in bidding_participants}
        personal_orders = PersonalOrderDBService.get_personal_orders(order_id)
        if personal_orders:
            for personal_order in personal_orders:
                personal_order.delete()
        for game in summary:
            if len(summary[game]) == 0:
                continue
            min_price = [10 ** 10, None]
            for company, price in summary[game].items():
                price_str = str(price).replace(',', '.')
                if not re.match(valid_pattern, price_str):
                    raise ValueError(f"Недопустимый формат цены для {game}: {price}. "
                                     "Допустимые форматы: число, число\\i, число\\p")
                if "\p" in price_str:
                    print(price_str)
                    min_price = [float(price_str[:-2]),
                                 next(lp for lp in item_prices_dict[game] if lp.participant.user.company == company)]
                    break
                elif "\i" not in price_str:
                    price_float = float(price_str)
                    if price_float < min_price[0]:
                        min_price = [price_float, next(
                            lp for lp in item_prices_dict[game] if lp.participant.user.company == company)]

            personal_orders_dict[min_price[1].participant.user.company].append(min_price[1].price)
        for company in personal_orders_dict:
            user = UserDBService.get_user_by_company(company)
            is_empty = len(personal_orders_dict[company]) == 0
            personal_order = PersonalOrderDBService.create_personal_order(user.id, order.id, is_empty)
            for price in personal_orders_dict[company]:
                personal_order_position = PersonalOrderPositionDBService.create_personal_order_position(
                    personal_order.id, price.id)
            OrderService.prepare_to_personal_orders(order_id)
        OrderDBService.set_deadline(order, None)
        for participant in bidding_participants:
            OrderParticipantDBService.set_participant_deadline(participant, None)
        return 0

    @staticmethod
    def get_personal_orders(username):
        user = UserDBService.get_user_by_username(username)
        personal_orders = user.personal_orders
        return personal_orders

    @staticmethod
    def get_personal_order_excel(personal_order_id):
        summary = []
        personal_order = PersonalOrderDBService.get_personal_orders_by_id(personal_order_id)
        positions = personal_order.positions
        for position in positions:
            position_dict = {
                "name": position.price.order_item.item.name,
                "amount": position.price.order_item.amount,
                "price": position.price.price
            }
            summary.append(position_dict)
        file_stream = ExcelService.make_person_order_excel(summary)
        return file_stream

    @staticmethod
    def get_all_personal_orders_excel(order_id):
        summary = {}
        order = OrderDBService.get_order_by_id(order_id)
        personal_orders = order.personal_orders
        personal_summary = []
        for personal_order in personal_orders:
            positions = personal_order.positions
            for position in positions:
                position_dict = {
                    "name": position.price.order_item.item.name,
                    "amount": position.price.order_item.amount,
                    "price": position.price.price
                }
                personal_summary.append(position_dict)
            summary[personal_order.user.company] = personal_summary
            personal_summary = []
        file_stream = ExcelService.make_person_orders_excel(summary)
        return file_stream

    @staticmethod
    def get_all_order_personal_orders(order_id):
        order = OrderDBService.get_order_by_id(order_id)
        personal_orders = order.personal_orders
        return personal_orders

    @staticmethod
    def unable_participant(participant_id):
        participant = OrderParticipantDBService.get_participant_by_id(participant_id)
        new_status_code = 111
        new_status = StatusDBService.get_status_by_status_code(new_status_code)
        OrderParticipantDBService.set_participant_status_id(participant, new_status.id)

    @staticmethod
    def return_participant(participant_id):
        participant = OrderParticipantDBService.get_participant_by_id(participant_id)
        new_status_code = 100
        new_status = StatusDBService.get_status_by_status_code(new_status_code)
        OrderParticipantDBService.set_participant_status_id(participant, new_status.id)

    @staticmethod
    def get_non_participating_user(order_id):
        participants_users = [prt.user for prt in OrderDBService.get_all_participants(order_id)]
        users = UserDBService.get_all_users()
        non_participating_users = [user for user in users if user not in participants_users]
        return non_participating_users

    @staticmethod
    def add_participants(order_id, user_ids):
        status = StatusDBService.get_status_by_status_code(100)
        order = OrderDBService.get_order_by_id(order_id)
        for user_id in user_ids:
            participant = OrderParticipantDBService.create_order_participant(order_id, user_id, status.id)
            for order_item in order.order_items:
                price = OrderParticipantPriceDBService.create_order_participant_price(participant.id, order_item.id,
                                                                                      price=None)
                OrderParticipantLastPriceDBService.create_order_participant_last_price(participant.id, price.id,
                                                                                       order_item.id)
        return 0
