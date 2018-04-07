const { Pool, Client } = require('pg')
require('dotenv').config();

const client = new Client({
  user: process.env.PGUSER,
  host: 'localhost',
  database: process.env.PGDB,
  password: process.env.PGPASS,
  port: 5432,
})
client.connect()

module.exports = {
	register: function(data, public_id, private_id) {
		client.query('INSERT INTO chat_user(public_data, public_id, private_id) VALUES($1, $2, $3)', [data, public_id, private_id], function (err, res) {
			if (err) throw err
		});
	},
	getData: function(public_id, callback) {
		client.query('SELECT data FROM chat_user WHERE public_id = $1', [public_id], function(err, res) {
			if (err) throw err
			if (res.rows.length == 1) {
				callback(res.rows[0].data);
			}
		});
	},
	goOnline: function(private_id, socket_id, callback) {
		client.query('UPDATE chat_user SET socket_id=$1 WHERE private_id=$2', [socket_id, private_id], function(err, res) {
			if (err) throw err
			if (res.rows.length == 1) {
				callback(true);
			}
		});
	},
	goOffline: function(socket_id) {
		client.query('UPDATE chat_user SET socket_id=NULL WHERE socket_id=$1', [socket_id], function(err, res) {
			if (err) throw err
		});
	}
}
