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
                                                                                          price=None,
                                                                                          submission_date=publishing_date)
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
        if participant and (participant.status.code == 107 or participant.status.code == 111):
            return {}
        return participant

    @staticmethod
    def offer_price(username, data):
        try:
            order_id = data.get("order_id")
            prices = data.get("prices")
            submission_date = datetime.now()
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
                                                                                          price, submission_date,
                                                                                          comment, status.id)
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
            active_order_participants = [prt for prt in order.participants]
            if not active_order_participants or all(
                    participant.status.code == 100 for participant in active_order_participants):
                raise
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
                    if deadline and deadline.tzinfo is None:  # If naive, make it UTC-aware
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
    def __validate_and_get_state(providers_offers):
        valid_price_pattern = r'^\d+(\.\d+)?(\\i|\\p)?(\\s+[1-9]\d*)?$'
        count_p = count_i = count_s = 0
        for company, price in providers_offers:
            if not re.match(valid_price_pattern, price):
                raise ValueError(f"Недопустимый формат цены для {price}.")
            if "\p" in price:
                count_p += 1
            if "\i" in price:
                count_i += 1
            if "\s" in price:
                count_s += 1
        if count_p == count_i == count_s == 0:
            return 0
        if count_p == 1 and count_i == count_s == 0:
            return 1
        if count_i > 0 and count_p == count_s == 0:
            return 2
        if count_s > 0 and count_p == count_i == 0:
            return 3
        raise ValueError(f"Недопустимoe количество флагов")

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
            offers = []
            offers_to_order = []
            providers_offers_items = [(company, str(price).replace(',', '.')) for company, price in
                                      summary[game].items() if str(price) != '']
            state = OrderService.__validate_and_get_state(providers_offers_items)
            if state == 0:
                offers = [(game, company, float(price)) for company, price in providers_offers_items]
                if offers:
                    offers_to_order = [min(offers, key=lambda x: x[2])]
            elif state == 1:
                offers = [(game, company, float(price[:price.find('\\')])) for company, price in providers_offers_items
                          if
                          '\p' in price]
                if offers:
                    offers_to_order = [min(offers, key=lambda x: x[2])]
            elif state == 2:
                offers = [(game, company, float(price[:price.find('\\')])) for company, price in providers_offers_items
                          if
                          '\i' not in price]
                if offers:
                    offers_to_order = [min(offers, key=lambda x: x[2])]
            elif state == 3:
                offers_to_order = [(game, company, float(price[:price.find('\\')]), int(price[price.find('s') + 1:]))
                                   for
                                   company, price in providers_offers_items if
                                   '\s' in price]
            for offer_to_order in offers_to_order:
                custom_amount = None
                if state != 3:
                    game, company, price = offer_to_order
                else:
                    game, company, price, custom_amount = offer_to_order

                personal_orders_dict[company].append((game, price, custom_amount))
        for company in personal_orders_dict:
            user = UserDBService.get_user_by_company(company)
            is_empty = len(personal_orders_dict[company]) == 0
            personal_order = PersonalOrderDBService.create_personal_order(user.id, order.id, is_empty)
            for game, price, custom_amount in personal_orders_dict[company]:
                price_db = next(
                    lp for lp in item_prices_dict[game] if lp.participant.user.company == company)
                personal_order_position = PersonalOrderPositionDBService.create_personal_order_position(
                    personal_order.id, price_db.price.id, custom_amount)
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
                "amount": position.custom_amount if position.custom_amount else position.price.order_item.amount,
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
                    "amount": position.custom_amount if position.custom_amount else position.price.order_item.amount,
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
        submission_date = datetime.now()
        for user_id in user_ids:
            participant = OrderParticipantDBService.create_order_participant(order_id, user_id, status.id)
            for order_item in order.order_items:
                price = OrderParticipantPriceDBService.create_order_participant_price(participant.id, order_item.id,
                                                                                      price=None,
                                                                                      submission_date=submission_date)
                OrderParticipantLastPriceDBService.create_order_participant_last_price(participant.id, price.id,
                                                                                       order_item.id)
        return 1

    @staticmethod
    def archive_order(order_id):
        order = OrderDBService.get_order_by_id(order_id)
        archived_at = datetime.now()
        all_statuses = StatusDBService.get_all_statuses()
        statuses_dict = dict()
        for status in all_statuses:
            archived_status = ArchivedStatusDBService.try_archive_status(status)
            statuses_dict[status.id] = archived_status.id

        archived_order = ArchivedOrderDBService.archive_order(order, statuses_dict[order.status.id], archived_at)

        order_items_dict = dict()
        for order_item in order.order_items:
            item = order_item.item
            archived_item = ArchivedItemDBService.try_archive_item(item)
            archived_order_item = ArchivedOrderItemDBService.archive_order_item(archived_order.id, archived_item.id,
                                                                                order_item)
            order_items_dict[order_item.id] = archived_order_item.id

        for participant in order.participants:
            user = participant.user
            status = participant.status
            archived_status = ArchivedStatusDBService.try_archive_status(status)
            archived_user = ArchivedUserDBService.try_archive_user(user)
            archived_participant = ArchivedOrderParticipantDBService.archive_participant(archived_user.id,
                                                                                         archived_order.id,
                                                                                         archived_status.id)
            prices_dict = dict()
            for prt_price in participant.prices:
                last_status_id = prt_price.last_participant_status_id
                archived_price_status = statuses_dict[last_status_id] if last_status_id else None
                archived_price = ArchivedOrderParticipantPriceDBService.archive_price(archived_participant.id,
                                                                                      order_items_dict[
                                                                                          prt_price.order_item.id],
                                                                                      archived_price_status,
                                                                                      prt_price)
                prices_dict[prt_price.id] = archived_price.id

            for prt_last_price in participant.last_prices:
                archived_last_price = ArchivedOrderParticipantLastPriceDBService.archive_last_price(
                    archived_participant.id, prices_dict[prt_last_price.price_id], prt_last_price.order_item.id,
                    prt_last_price)

            personal_order = next(
                (personal_order for personal_order in user.personal_orders if personal_order.order.id == order.id),
                None)
            if personal_order:
                archived_personal_order = ArchivedPersonalOrderDBService.archive_personal_order(archived_user.id,
                                                                                                archived_order.id,
                                                                                                personal_order)

                for position in personal_order.positions:
                    ArchivedPersonalOrderPositionDBService.archive_personal_order_position(archived_personal_order.id,
                                                                                           prices_dict[
                                                                                               position.price.id],
                                                                                           position)
        OrderService.delete_order(order_id)
        return 1
