from flask import request, send_file
from flask_restx import Resource
from presentation.api.models.order_models import OrderDTO
from application.services.order_service import OrderService
from flask_jwt_extended import jwt_required, get_jwt_identity
from presentation.api.decorators.admin_required import admin_required

order_ns = OrderDTO.namespace
order_participant_model = OrderDTO.order_participant_model
order_model = OrderDTO.order_model
admin_order_model = OrderDTO.admin_order_model
order_participant_preview_model = OrderDTO.order_participant_preview_model
order_preview_model = OrderDTO.order_preview_model
order_participant_status_model = OrderDTO.order_participant_status_model
personal_order_model = OrderDTO.personal_order_model


@order_ns.route('/create_admin_order')
class CreateAdminOrder(Resource):
    @order_ns.expect(order_model)
    @jwt_required()
    @admin_required
    def post(self):
        data = request.json
        return OrderService.create_order(data)


@order_ns.route('/delete_order')
class DeleteOrder(Resource):
    @order_ns.doc(params={'id': 'Id of the order to delete'})
    @jwt_required()
    @admin_required
    def delete(self):
        order_id = request.args.get('id')

        if not order_id:
            return {"message": "Id is required"}, 400

        response, code = OrderService.delete_order(order_id)

        return response, code


@order_ns.route('/get_all_orders')
class GetAllOrdersPreview(Resource):
    @order_ns.marshal_list_with(order_preview_model)
    def get(self):
        return OrderService.get_all_orders()


@order_ns.route('/get_all_user_participation')
class GetAllUserOrderParticipation(Resource):
    @jwt_required()
    def get(self):
        username = get_jwt_identity()
        response_object = OrderService.get_all_user_open_participation(username)
        if response_object["status"] == "success":
            response = response_object["response"]
            return order_ns.marshal(response, order_participant_preview_model), 200
        else:
            return response_object, 400


@order_ns.route('/admin_order/<int:order_id>')
class GetAdminOrderContent(Resource):
    @order_ns.marshal_with(admin_order_model)
    def get(self, order_id):
        return OrderService.get_admin_order_content(order_id)


@order_ns.route('/order/<int:order_id>')
class GetOrderContent(Resource):
    @jwt_required()
    def get(self, order_id):
        try:
            username = get_jwt_identity()
            order = OrderService.get_user_order_content(username, order_id)
            if order is None:
                return {}, 200
            return order_ns.marshal(order, order_participant_model), 200
        except Exception as e:
            print(e)
            response_object = {
                'status': 'fail',
                'message': 'Try again'
            }
            return response_object, 500


@order_ns.route('/update_order_meta')
class UpdateOrderMeta(Resource):
    @order_ns.doc(params={'id': 'Id of the order'})
    @jwt_required()
    @admin_required
    def put(self):
        order_id = request.args.get('order_id')
        if not order_id:
            return {"message": "Id is required"}, 400
        data = request.json
        response, code = OrderService.update_order_meta(order_id, data)

        return response, code


@order_ns.route('/offer_prices')
class GetOrderContent(Resource):
    @jwt_required()
    def post(self):
        username = get_jwt_identity()
        data = request.json
        responce_object = OrderService.offer_price(username, data)
        if responce_object["status"] == "success":
            return responce_object["responce"], 200
        return responce_object, 400


@order_ns.route('/get_current_order_state')
class GetCurrentOrderState(Resource):
    @order_ns.doc(params={'id': 'Id of the order'})
    @jwt_required()
    @admin_required
    def get(self):
        order_id = request.args.get('order_id')
        if not order_id:
            return {"message": "Id is required"}, 400
        file_stream = OrderService.get_current_order_state(order_id)
        return send_file(
            file_stream,
            as_attachment=True,
            download_name='summary.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )


@order_ns.route('/get_all_order_participants')
class GetAllOrderParticipants(Resource):
    @order_ns.marshal_list_with(order_participant_status_model)
    @order_ns.doc(params={'id': 'Id of the order'})
    @jwt_required()
    @admin_required
    def get(self):
        order_id = request.args.get('order_id')
        if not order_id:
            return {"message": "Id is required"}, 400
        responce, code = OrderService.get_all_order_participants(order_id)
        return responce, code


@order_ns.route('/start_bidding')
class StartBidding(Resource):
    @order_ns.doc(params={'id': 'Id of the order'})
    @jwt_required()
    @admin_required
    def post(self):
        order_id = request.args.get('order_id')
        if not order_id:
            return {"message": "Id is required"}, 400
        data = request.json
        responce, code = OrderService.start_bidding(order_id, data)
        return responce, code


@order_ns.route('/set_participant_status')
class SetParticipantStatus(Resource):
    @jwt_required()
    def post(self):
        data = request.json
        username = get_jwt_identity()
        responce, code = OrderService.set_participant_status(username, data)
        return responce, code


@order_ns.route('/update_deadline')
class StartBidding(Resource):
    @order_ns.doc(params={'id': 'Id of the order'})
    @jwt_required()
    @admin_required
    def put(self):
        order_id = request.args.get('order_id')
        if not order_id:
            return {"message": "Id is required"}, 400
        data = request.json
        responce, code = OrderService.update_order_deadline(order_id, data)
        return responce, code


@order_ns.route('/update_participant_deadline')
class StartBidding(Resource):
    @order_ns.doc(params={'id': 'Id of the participant'})
    @jwt_required()
    @admin_required
    def put(self):
        participant_id = request.args.get('participant_id')
        if not participant_id:
            return {"message": "Id is required"}, 400
        data = request.json
        responce, code = OrderService.update_participant_deadline(participant_id, data)
        return responce, code


@order_ns.route('/create_personal_orders')
class CreatePersonalOrders(Resource):
    @order_ns.doc(params={'id': 'Id of the order'})
    @jwt_required()
    @admin_required
    def post(self):
        order_id = request.args.get('order_id')
        if not order_id:
            return {"message": "Id is required"}, 400
        file = request.files['file']
        try:
            OrderService.create_personal_orders(order_id, file)
            responce_object = {
                "status": "success",
                "message": "Personal order successfully created"
            }
            return responce_object, 201
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 400


@order_ns.route('/get_personal_orders')
class GetPersonalOrders(Resource):
    @jwt_required()
    def get(self):
        username = get_jwt_identity()
        try:
            personal_orders = OrderService.get_personal_orders(username)
            return order_ns.marshal(personal_orders, personal_order_model), 200
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 400


@order_ns.route('/add_participant')
class UnableParticipant(Resource):
    @order_ns.doc(params={'id': 'Id of the user'})
    @jwt_required()
    @admin_required
    def post(self):
        pass


@order_ns.route('/unable_participant')
class UnableParticipant(Resource):
    @order_ns.doc(params={'id': 'Id of the participant'})
    @jwt_required()
    @admin_required
    def post(self):
        try:

            participant_id = request.args.get('participant_id')
            if not participant_id:
                return {"message": "Id is required"}, 400
            OrderService.unable_participant(participant_id)
            return {"status": "success", "message": "Participant successfully unabled"}, 200
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 500


@order_ns.route('/return_participant')
class ReturnParticipant(Resource):
    @order_ns.doc(params={'id': 'Id of the participant'})
    @jwt_required()
    @admin_required
    def post(self):
        try:
            participant_id = request.args.get('participant_id')
            if not participant_id:
                return {"message": "Id is required"}, 400
            OrderService.return_participant(participant_id)
            return {"status": "success", "message": "Participant successfully unabled"}, 200
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 500


@order_ns.route('/get_all_order_personal_orders')
class GetAllPersonalOrders(Resource):
    @order_ns.doc(params={'id': 'Id of the order'})
    @jwt_required()
    @admin_required
    def get(self):
        try:
            order_id = request.args.get('order_id')
            if not order_id:
                return {"message": "Id is required"}, 400
            personal_orders = OrderService.get_all_order_personal_orders(order_id)
            return order_ns.marshal(personal_orders, personal_order_model), 200
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 400


@order_ns.route('/download_personal_order')
class DownloadPersonalOrder(Resource):
    @order_ns.doc(params={'id': 'Id of the personal order'})
    @order_ns.doc(params={'filename': 'Name of the file'})
    @jwt_required()
    def get(self):
        try:
            personal_order_id = request.args.get('personal_order_id')
            filename = request.args.get('filename')
            if not personal_order_id:
                return {"message": "Id is required"}, 400
            if not filename:
                return {"message": "Filename is required"}, 400

            file_stream = OrderService.get_personal_order_excel(personal_order_id)
            return send_file(
                file_stream,
                as_attachment=True,
                download_name=f'{filename}.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 400


@order_ns.route('/download_all_personal_orders')
class DownloadAllPersonalOrders(Resource):
    @order_ns.doc(params={'id': 'Id of the personal order'})
    @order_ns.doc(params={'filename': 'Name of the file'})
    @jwt_required()
    @admin_required
    def get(self):
        try:
            order_id = request.args.get('order_id')
            filename = request.args.get('filename')
            if not order_id:
                return {"message": "Id is required"}, 400
            if not filename:
                return {"message": "Filename is required"}, 400

            file_stream = OrderService.get_all_personal_orders_excel(order_id)
            return send_file(
                file_stream,
                as_attachment=True,
                download_name=f'{filename}_all_personal_orders.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        except Exception as ex:
            print(ex)
            responce_object = {
                "status": "fail",
                "message": "Try again"
            }
            return responce_object, 500
