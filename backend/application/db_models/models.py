from exts import db
from sqlalchemy import UniqueConstraint


class BaseModel(db.Model):
    __abstract__ = True

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        try:
            db.session.delete(self)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e


class InitializationStatus(BaseModel):
    __tablename__ = 'initialization_status'

    id = db.Column(db.Integer, primary_key=True)
    is_initialized = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'<InitializationStatus is_initialized={self.is_initialized}>'


class User(BaseModel):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    username = db.Column(db.Text, unique=True)
    email = db.Column(db.Text)
    company = db.Column(db.Text)
    password = db.Column(db.Text)
    role = db.Column(db.Text)
    registration_date = db.Column(db.DateTime)

    # Связи с каскадным удалением
    participants = db.relationship("OrderParticipant", back_populates="user", cascade="all, delete-orphan")
    personal_orders = db.relationship("PersonalOrder", back_populates="user", cascade="all, delete-orphan")


class Order(BaseModel):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    publishing_date = db.Column(db.DateTime)
    title = db.Column(db.Text)
    description = db.Column(db.Text)
    status_id = db.Column(db.Integer, db.ForeignKey('statuses.id', ondelete="CASCADE"))
    permitted_providers = db.Column(db.JSON)
    deadline = db.Column(db.DateTime)

    # Связи с каскадным удалением
    status = db.relationship("Status", back_populates="orders")
    order_items = db.relationship("OrderItem", back_populates="orders", cascade="all, delete-orphan")
    participants = db.relationship("OrderParticipant", back_populates="order", cascade="all, delete-orphan")
    personal_orders = db.relationship("PersonalOrder", back_populates="order", cascade="all, delete-orphan")


class Item(BaseModel):
    __tablename__ = 'items'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.Text)

    # Связи с каскадным удалением
    order_items = db.relationship("OrderItem", back_populates="item", cascade="all, delete-orphan")


class OrderItem(BaseModel):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete="CASCADE"))
    item_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete="CASCADE"))
    amount = db.Column(db.Integer)
    recommended_price = db.Column(db.Numeric(10, 2), default=None)

    # Связи с каскадным удалением
    orders = db.relationship("Order", back_populates="order_items")
    item = db.relationship("Item", back_populates="order_items")
    participant_prices = db.relationship("OrderParticipantPrice", back_populates="order_item",
                                         cascade="all, delete-orphan")
    last_prices = db.relationship("OrderParticipantLastPrice", back_populates="order_item",
                                  cascade="all, delete-orphan")


class OrderParticipant(BaseModel):
    __tablename__ = 'order_participants'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"))
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete="CASCADE"))
    status_id = db.Column(db.Integer, db.ForeignKey('statuses.id', ondelete="CASCADE"))
    deadline = db.Column(db.DateTime)

    # Связи с каскадным удалением
    user = db.relationship("User", back_populates="participants")
    order = db.relationship("Order", back_populates="participants")
    status = db.relationship("Status", back_populates="participants")
    prices = db.relationship("OrderParticipantPrice", back_populates="participant", cascade="all, delete-orphan")
    last_prices = db.relationship("OrderParticipantLastPrice", back_populates="participant",
                                  cascade="all, delete-orphan")


class OrderParticipantPrice(BaseModel):
    __tablename__ = 'order_participants_prices'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    order_participant_id = db.Column(db.Integer, db.ForeignKey('order_participants.id', ondelete="CASCADE"))
    order_item_id = db.Column(db.Integer, db.ForeignKey('order_items.id', ondelete="CASCADE"))
    price = db.Column(db.Numeric(10, 2), default=None)
    last_participant_status_id = db.Column(db.Integer, db.ForeignKey('statuses.id', ondelete="CASCADE"))
    comment = db.Column(db.Text)

    # Связи с каскадным удалением
    participant = db.relationship("OrderParticipant", back_populates="prices")
    order_item = db.relationship("OrderItem", back_populates="participant_prices")
    last_price = db.relationship("OrderParticipantLastPrice", back_populates="price", cascade="all, delete-orphan",
                                 uselist=False)
    personal_order_positions = db.relationship("PersonalOrderPosition", back_populates="price",
                                               cascade="all, delete-orphan")
    last_participant_status = db.relationship("Status", back_populates="prices")


class OrderParticipantLastPrice(BaseModel):
    __tablename__ = 'order_participants_last_prices'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    order_participant_id = db.Column(db.Integer, db.ForeignKey('order_participants.id', ondelete="CASCADE"))
    price_id = db.Column(db.Integer, db.ForeignKey('order_participants_prices.id', ondelete="CASCADE"))
    order_item_id = db.Column(db.Integer, db.ForeignKey('order_items.id', ondelete="CASCADE"))
    is_the_best_price = db.Column(db.Boolean, default=None)

    # Связи с каскадным удалением
    participant = db.relationship("OrderParticipant", back_populates="last_prices")
    price = db.relationship("OrderParticipantPrice", back_populates="last_price")
    order_item = db.relationship("OrderItem", back_populates="last_prices")


class Status(BaseModel):
    __tablename__ = 'statuses'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    code = db.Column(db.Integer)
    message = db.Column(db.Text)

    # Связи
    participants = db.relationship("OrderParticipant", back_populates="status")
    orders = db.relationship("Order", back_populates="status")
    prices = db.relationship("OrderParticipantPrice", back_populates="last_participant_status")


class PersonalOrder(BaseModel):
    __tablename__ = 'personal_orders'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"))
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete="CASCADE"))
    is_empty = db.Column(db.Boolean, default=True)

    # Связи с каскадным удалением
    user = db.relationship("User", back_populates="personal_orders")
    order = db.relationship("Order", back_populates="personal_orders")
    positions = db.relationship("PersonalOrderPosition", back_populates="personal_order", cascade="all, delete-orphan")

    # Уникальный индекс для комбинации user_id и order_id
    __table_args__ = (
        UniqueConstraint('user_id', 'order_id', name='unique_user_order'),
    )


class PersonalOrderPosition(BaseModel):
    __tablename__ = 'personal_order_positions'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    personal_order_id = db.Column(db.Integer, db.ForeignKey('personal_orders.id', ondelete="CASCADE"))
    price_id = db.Column(db.Integer, db.ForeignKey('order_participants_prices.id', ondelete="CASCADE"))

    # Связи
    personal_order = db.relationship("PersonalOrder", back_populates="positions")
    price = db.relationship("OrderParticipantPrice", back_populates="personal_order_positions")

    # Уникальный индекс для комбинации personal_order_id и price_id
    __table_args__ = (
        UniqueConstraint('personal_order_id', 'price_id', name='unique_personal_order_price'),
    )


# Archived Models
class ArchivedUser(BaseModel):
    __tablename__ = 'archived_users'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    username = db.Column(db.Text, unique=True)
    email = db.Column(db.Text)
    company = db.Column(db.Text)
    password = db.Column(db.Text)
    role = db.Column(db.Text)
    registration_date = db.Column(db.DateTime)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    participants = db.relationship("ArchivedOrderParticipant", back_populates="user")
    personal_orders = db.relationship("ArchivedPersonalOrder", back_populates="user")


class ArchivedItem(BaseModel):
    __tablename__ = 'archived_items'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.Text)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    order_items = db.relationship("ArchivedOrderItem", back_populates="item")


class ArchivedStatus(BaseModel):
    __tablename__ = 'archived_statuses'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    code = db.Column(db.Integer)
    message = db.Column(db.Text)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    participants = db.relationship("ArchivedOrderParticipant", back_populates="status")
    orders = db.relationship("ArchivedOrder", back_populates="status")
    prices = db.relationship("ArchivedOrderParticipantPrice", back_populates="last_participant_status")


class ArchivedOrder(BaseModel):
    __tablename__ = 'archived_orders'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    publishing_date = db.Column(db.DateTime)
    title = db.Column(db.Text)
    description = db.Column(db.Text)
    status_id = db.Column(db.Integer, db.ForeignKey('archived_statuses.id', ondelete="RESTRICT"))
    permitted_providers = db.Column(db.JSON)
    participating_providers = db.Column(db.JSON)
    deadline = db.Column(db.DateTime)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    status = db.relationship("ArchivedStatus", back_populates="orders")
    order_items = db.relationship("ArchivedOrderItem", back_populates="orders")
    participants = db.relationship("ArchivedOrderParticipant", back_populates="order")
    personal_orders = db.relationship("ArchivedPersonalOrder", back_populates="order")


class ArchivedOrderItem(BaseModel):
    __tablename__ = 'archived_order_items'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('archived_orders.id', ondelete="RESTRICT"))
    item_id = db.Column(db.Integer, db.ForeignKey('archived_items.id', ondelete="RESTRICT"))
    amount = db.Column(db.Integer)
    recommended_price = db.Column(db.Numeric(10, 2), default=None)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    orders = db.relationship("ArchivedOrder", back_populates="order_items")
    item = db.relationship("ArchivedItem", back_populates="order_items")
    participant_prices = db.relationship("ArchivedOrderParticipantPrice", back_populates="order_item")
    last_prices = db.relationship("ArchivedOrderParticipantLastPrice", back_populates="order_item")


class ArchivedOrderParticipant(BaseModel):
    __tablename__ = 'archived_order_participants'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('archived_users.id', ondelete="RESTRICT"))
    order_id = db.Column(db.Integer, db.ForeignKey('archived_orders.id', ondelete="RESTRICT"))
    status_id = db.Column(db.Integer, db.ForeignKey('archived_statuses.id', ondelete="RESTRICT"))
    deadline = db.Column(db.DateTime)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    user = db.relationship("ArchivedUser", back_populates="participants")
    order = db.relationship("ArchivedOrder", back_populates="participants")
    status = db.relationship("ArchivedStatus", back_populates="participants")
    prices = db.relationship("ArchivedOrderParticipantPrice", back_populates="participant")
    last_prices = db.relationship("ArchivedOrderParticipantLastPrice", back_populates="participant")


class ArchivedOrderParticipantPrice(BaseModel):
    __tablename__ = 'archived_order_participants_prices'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    order_participant_id = db.Column(db.Integer, db.ForeignKey('archived_order_participants.id', ondelete="RESTRICT"))
    order_item_id = db.Column(db.Integer, db.ForeignKey('archived_order_items.id', ondelete="RESTRICT"))
    price = db.Column(db.Numeric(10, 2), default=None)
    last_participant_status_id = db.Column(db.Integer, db.ForeignKey('archived_statuses.id', ondelete="RESTRICT"))
    comment = db.Column(db.Text)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    participant = db.relationship("ArchivedOrderParticipant", back_populates="prices")
    order_item = db.relationship("ArchivedOrderItem", back_populates="participant_prices")
    last_price = db.relationship("ArchivedOrderParticipantLastPrice", back_populates="price", uselist=False)
    personal_order_positions = db.relationship("ArchivedPersonalOrderPosition", back_populates="price")
    last_participant_status = db.relationship("ArchivedStatus", back_populates="prices")


class ArchivedOrderParticipantLastPrice(BaseModel):
    __tablename__ = 'archived_order_participants_last_prices'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    order_participant_id = db.Column(db.Integer, db.ForeignKey('archived_order_participants.id', ondelete="RESTRICT"))
    price_id = db.Column(db.Integer, db.ForeignKey('archived_order_participants_prices.id', ondelete="RESTRICT"))
    order_item_id = db.Column(db.Integer, db.ForeignKey('archived_order_items.id', ondelete="RESTRICT"))
    is_the_best_price = db.Column(db.Boolean, default=None)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    participant = db.relationship("ArchivedOrderParticipant", back_populates="last_prices")
    price = db.relationship("ArchivedOrderParticipantPrice", back_populates="last_price")
    order_item = db.relationship("ArchivedOrderItem", back_populates="last_prices")


class ArchivedPersonalOrder(BaseModel):
    __tablename__ = 'archived_personal_orders'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('archived_users.id', ondelete="RESTRICT"))
    order_id = db.Column(db.Integer, db.ForeignKey('archived_orders.id', ondelete="RESTRICT"))
    is_empty = db.Column(db.Boolean, default=True)
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    user = db.relationship("ArchivedUser", back_populates="personal_orders")
    order = db.relationship("ArchivedOrder", back_populates="personal_orders")
    positions = db.relationship("ArchivedPersonalOrderPosition", back_populates="personal_order")

    # Уникальный индекс
    __table_args__ = (
        UniqueConstraint('user_id', 'order_id', name='unique_archived_user_order'),
    )


class ArchivedPersonalOrderPosition(BaseModel):
    __tablename__ = 'archived_personal_order_positions'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    personal_order_id = db.Column(db.Integer, db.ForeignKey('archived_personal_orders.id', ondelete="RESTRICT"))
    price_id = db.Column(db.Integer, db.ForeignKey('archived_order_participants_prices.id', ondelete="RESTRICT"))
    archived_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    # Relationships mirroring active model (no cascading)
    personal_order = db.relationship("ArchivedPersonalOrder", back_populates="positions")
    price = db.relationship("ArchivedOrderParticipantPrice", back_populates="personal_order_positions")

    # Уникальный индекс
    __table_args__ = (
        UniqueConstraint('personal_order_id', 'price_id', name='unique_archived_personal_order_price'),
    )