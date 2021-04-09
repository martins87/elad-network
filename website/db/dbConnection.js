require('dotenv').config();

const connect = async () => {
    if (global.connection && global.connection.state !== 'disconnected') {
        return global.connection;
    }
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection(process.env.MYSQL_DB_URL);
    console.log('Connected to MySQL database');
    global.connection = connection;
    return connection;
}

// connect();

/* TABLE Property
 * - name varchar(60)
 * - price varchar(10)
 * - address varchar(100)
 * - token_symbol varchar(10)
 * - total_supply varchar(20)
 * - eth_price varchar(20)
 * - description varchar(600)
 * - image_filename varchar(500)
 */
const selectProperties = async () => {
    const conn = await connect();
    const [rows] = await conn.query('SELECT * FROM Property;');
    return rows;
}

const insertProperty = async (property) => {
    const conn = await connect();
    const sql = `INSERT INTO Property (name, price, address, token_symbol, total_supply, eth_price, description, image_filename)
                 VALUES (?,?,?,?,?,?,?,?)`;
    const values = [
        property.name,
        property.price,
        property.address,
        property.token_symbol,
        '3500', //property.total_supply,
        '1', //property.eth_price,
        property.description,
        property.image_filename
    ];

    return await conn.query(sql, values);
}

const updateProperty = async () => {
    const conn = await connect();
    const sql = `UPDATE Property SET name=?, price=?, address=?, token_symbol=?, total_supply=?, eth_price=?, description=?, image_filename=?`;
    const values = [
        '1 bedroom apartment',
        '5000000',
        'Thackeray Street, Kensington, W8',
        'KEN',
        '3500',
        '1',
        'A tasteful-presented 1 bedroom 1st-floor apartment set within a convenient location very close to all the amenities of the Kensington High St & the famous Hyde Park. The property features 400 sq ft in size and is offered on a furnished basis.',
        '1_bedroom_apartment.png'
    ];
    return await conn.query(sql, values);
}

const deleteProperty = async () => {
    const conn = await connect();
    const sql = `DELETE FROM Property WHERE token_symbol=?`;
    const values = 'KEN';
    return await conn.query(sql, values);
}

/* TABLE User
 * - fullname varchar(60)
 * - username varchar(30)
 * - password varchar(100)
 */
const selectUser = async (username) => {
    const conn = await connect();
    const sql = 'SELECT * FROM User WHERE username = ?';
    const values = [username];
    const [user] = await conn.query(sql, values);
    return user;
}

const insertUser = async ({id, fullname, username, password}) => {
    const conn = await connect();
    const sql = 'INSERT INTO User (id, fullname, username, password) VALUES (?, ?, ?, ?)';
    const values = [id, fullname, username, password];
    return await conn.query(sql, values);
}

module.exports = {
    connect,
    selectProperties,
    insertProperty,
    updateProperty,
    deleteProperty,
    selectUser,
    insertUser
}