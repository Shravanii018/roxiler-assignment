const sequelize = require('../config/db');
const User = require('./user');
const Store = require('./store');
const Rating = require('./rating');

// A store belongs to one owner (a User with role='owner')
User.hasOne(Store, { foreignKey: 'owner_id', as: 'ownedStore' });
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Ratings: many-to-many between User and Store, through Rating
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Store.hasMany(Rating, { foreignKey: 'store_id', as: 'ratings' });
Rating.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

module.exports = { sequelize, User, Store, Rating };
