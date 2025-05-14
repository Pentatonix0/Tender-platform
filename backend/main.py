from flask import Flask
from flask_restx import Api
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from application.services.order_service import OrderService
from exts import db
from presentation.api.controllers.order_controller import order_ns
from presentation.api.controllers.auth_controller import auth_ns
from presentation.api.controllers.user_controller import users_ns
from presentation.api.controllers.excel_controller import excel_ns
from application.services.db_service import PrimaryInitializationDBService
from config import ProdConfig

app = Flask(__name__)
app.config.from_object(ProdConfig)



CORS(app, origins=[
    "http://localhost:5173",
    "http://109.73.206.224",
    "http://goodprice.ae"
], supports_credentials=True)


db.init_app(app)
with app.app_context():
    db.create_all()
    if not PrimaryInitializationDBService.is_initialized():
        username = app.config['ADMIN_USERNAME']
        email = app.config['ADMIN_EMAIL']
        company = app.config['ADMIN_COMPANY']
        password = app.config['ADMIN_PASSWORD']
        db.create_all()
        PrimaryInitializationDBService.init(username, email, company, password)
        PrimaryInitializationDBService.initialization_done()

migrate = Migrate(app, db)
JWTManager(app)

api = Api(app, doc='/docs')
api.add_namespace(order_ns)
api.add_namespace(auth_ns)
api.add_namespace(users_ns)
api.add_namespace(excel_ns)


def scheduled_task():
    with app.app_context():
        try:
            OrderService.manage_deadline_status()
        except Exception as e:
            print(f"Ошибка в запланированной задаче: {str(e)}")


with app.app_context():
    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(
        id='Scheduled Task',
        func=scheduled_task,
        trigger='interval',
        seconds=30
    )
    scheduler.start()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
