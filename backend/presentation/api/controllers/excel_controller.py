from flask import request
from flask_restx import Resource
from ..models.excel_models import ExcelDTO
from application.services.excel_service import ExcelService

excel_ns = ExcelDTO.namespace
order_excel_row_model = ExcelDTO.order_excel_row_model


@excel_ns.route("/excel_process")
class ProcessExcelFile(Resource):
    @excel_ns.marshal_list_with(order_excel_row_model)
    def post(self):
        file = request.files['file']
        return ExcelService.convert_excel_to_json(file)


