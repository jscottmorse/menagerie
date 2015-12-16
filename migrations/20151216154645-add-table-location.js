'use strict';

var dbm;
var type;
var seed;
var TABLE;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;

    TABLE = 'location';
};

exports.up = function(db, callback) {
    db.createTable(TABLE, {
        columns: {
            id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
            uuid: {type: 'text'},
            name: {type: 'text'},
            description: {type: 'text'},
            geolocation_lng: {type: 'text'},
            geolocation_lat: {type: 'text'},
            sublocation: {type: 'int'},
            createdAt: { type: 'timestamp with time zone' },
            updatedAt: { type: 'timestamp with time zone' }
        },
        ifNotExists: true
    }, callback);
};

exports.down = function(db, callback) {
    db.dropTable(TABLE, callback);
};
