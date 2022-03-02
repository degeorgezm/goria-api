/**
 * database.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Defines various database functions
 */

module.exports.setup = function (mongoose, winston) {


    var options = {
        useMongoClient: true,
        autoIndex: true, // Build indexes
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10, // Maintain up to 10 socket connections
        bufferMaxEntries: 0 // If not connected, return errors immediately rather than waiting for reconnect
    };

    mongoose.connection.on('open', function () {
        winston.info('Connected to mongodb server.');
        mongoose.connection.db.listCollections().toArray(function (err, names) {
            //winston.info(names);
        });
    });

    // Error handler
    mongoose.connection.on('error', function (err) {
        winston.info('Server Error ' + err);
    });

    // Reconnect when closed
    mongoose.connection.on('disconnected', function () {
        winston.info('Server Disconnected');
    });

    winston.info("Connecting to Database - " + global.MONGODB_URL);

    mongoose.Promise = global.Promise;
    mongoose.connect(global.MONGODB_URL, options, function (err) {
        if (!err) {
            winston.log("Database connected successfully");
        } else if (err) {
            winston.log(err);
            process.exit(1);
        };
    });


}