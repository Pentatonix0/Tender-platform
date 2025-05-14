from decouple import config
import os

BASE_DIR = os.path.dirname(os.path.realpath(__file__))


class Config:
    SECRET_KEY = config('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = config(
        'SQLALCHEMY_TRACK_MODIFICATIONS', cast=bool)
    ADMIN_USERNAME = config('ADMIN_USERNAME')
    ADMIN_EMAIL = config('ADMIN_EMAIL')
    ADMIN_COMPANY = config('ADMIN_COMPANY')
    ADMIN_PASSWORD = config('ADMIN_PASSWORD')


class DevConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, 'dev.db')
    DEBUG = True
    SQLALCHEMY_ECHO = True
    JSON_AS_ASCII = False


class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, 'prod.db')
    DEBUG = True
    SQLALCHEMY_ECHO = True
    JSON_AS_ASCII = False


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + \
                              os.path.join(BASE_DIR, 'test.db')
    SQLALCHEMY_ECHO = False
    TESTING = True
