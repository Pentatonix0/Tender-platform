from flask_restx import Namespace, fields

class ExcelDTO:
    namespace = Namespace('excel', description="A namespace for file processing")
    order_excel_row_model = namespace.model(
        "Item",
        {
            "name": fields.String(),
            "amount": fields.Integer()
        }
    )