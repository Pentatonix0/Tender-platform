from flask import request
from flask_restx import Resource
from ..models.excel_models import ExcelDTO
from application.services.excel_service import ExcelService

excel_ns = ExcelDTO.namespace
order_excel_row_model = ExcelDTO.order_excel_row_model
order_excel_price_model = ExcelDTO.order_excel_price_model


@excel_ns.route("/excel_process")
class ProcessExcelFile(Resource):
    @excel_ns.marshal_list_with(order_excel_row_model)
    def post(self):
        file = request.files['file']
        return ExcelService.convert_excel_to_json(file)


@excel_ns.route("/get_prices_from_excel")
class GetPricesFromExcel(Resource):
    @excel_ns.marshal_list_with(order_excel_price_model)
    def post(self):
        file = request.files['file']
        return ExcelService.read_prices(file)



