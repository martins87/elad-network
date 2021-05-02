require('dotenv').config();

const connect = async () => {
    try {
        if (global.connection && global.connection.state !== 'disconnected') {
            return global.connection;
        }
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection(process.env.MYSQL_DB_URL);
        if (connection.errno) {
            throw new Error('Error connecting to database');
        }

        console.log('Connected to MySQL database. Connection id:', connection.connection.connectionId);
        global.connection = connection;
        return connection;
    } catch (error) {
        console.log('Error connecting to database:', error);
        return null;
    }
}

const connectWithPool = async () => {
    try {
        if (global.connection && global.connection.state !== 'disconnected') {
            return global.connection;
        }
        const mysql = require('mysql2/promise');

        // const connection = await mysql.createConnection(process.env.MYSQL_DB_URL);
        // mysql://elad:3l4dn3tw0rk_21@166.62.74.162:3306/elad-network
        const pool = mysql.createPool({
            host: '166.62.74.162',
            user: 'elad',
            password: '3l4dn3tw0rk_21',
            database: 'elad-network',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('Connected to MySQL database with a connection pool');
        global.connection = pool;
        return pool;
    } catch (error) {
        console.log('Error connecting to database:', error);
        return null;
    }
}

// connect();

/* TABLE Property
 * - id varchar(30)
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
    try {
        const conn = await connect();
        if (conn !== null) {
            const [rows] = await conn.query('SELECT * FROM Property;');
            console.log('[dbConnection] properties:', rows);
            return rows;
        }
    } catch (error) {
        console.log('Error fetching properties:', error);
        return [];
    }
}

const deleteProperties = async () => {
    try {
        const conn = await connect();
        if (conn !== null) {
            const [rows] = await conn.query('DELETE FROM Property;');
            return rows;
        }
    } catch (error) {
        console.log('Error deleting properties:', error);
        return [];
    }
}

const selectPropertyById = async (id) => {
    try {
        const conn = await connect();
        if (conn !== null) {
            const sql = 'SELECT * FROM Property WHERE id = ?';
            const values = [id];
            const [rows] = await conn.query(sql, values);
            return rows;
        }
    } catch (error) {
        console.log(`Error fetching property #${id}:`, error);
        return [];
    }
}

const insertProperty = async (property) => {
    try {
        const conn = await connect();
        if (conn !== null) {
            const sql = `INSERT INTO Property (id, name, price, address, token_symbol, total_supply, eth_price, description, image_filename)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                property.id,
                property.name,
                property.price,
                property.address,
                property.token_symbol,
                property.total_supply,
                property.eth_price,
                property.description,
                property.image_filename
            ];
        
            const [rows] = await conn.query(sql, values);
            console.log('[dbConnnection] insertProperty:', rows);
            return rows;
        }
    } catch (error) {
        console.log('Error inserting a property:', error);
        return [];
    }
}

const updateProperty = async () => {
    try {
        const conn = await connect();
        if (conn !== null) {
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
    } catch (error) {
        console.log('Error updating property:', error);
        return [];
    }
}

const deleteProperty = async () => {
    try {
        const conn = await connect();
        if (conn !== null) {
            const sql = `DELETE FROM Property WHERE token_symbol=?`;
            const values = 'KEN';
            return await conn.query(sql, values);
        }
    } catch (error) {
        console.log('Error deleting property:', error);
        return [];
    }
}

/* TABLE User
 * - id varchar(30)
 * - fullname varchar(60)
 * - username varchar(30)
 * - password varchar(100)
 */
const selectUsers = async () => {
    try {
        const conn = await connect();
        if (conn !== null) {
            const [rows] = await conn.query('SELECT * FROM User;');
            console.log('[dbConnection] users:', rows);
            return rows;
        }
    } catch (error) {
        console.log('Error fetching users:', error);
        return [];
    }
}

const selectUser = async (username) => {
    try {
        const conn = await connect();
        if (conn !== null) {
            const sql = 'SELECT * FROM User WHERE username = ?';
            const values = [username];
            const [user] = await conn.query(sql, values);
            return user;
        }
    } catch (error) {
        console.log(`Error fetching user ${username}:`, error);
        return [];
    }
}

const insertUser = async ({id, fullname, username, password}) => {
    try {
        const conn = await connect();
        if (conn !== null) {
            const sql = 'INSERT INTO User (id, fullname, username, password) VALUES (?, ?, ?, ?)';
            const values = [id, fullname, username, password];
            return await conn.query(sql, values);
        }
    } catch (error) {
        console.log(`Error inserting user ${username}:`, error);
        return [];
    }
}

module.exports = {
    connect,
    connectWithPool,
    selectProperties,
    deleteProperties,
    selectPropertyById,
    insertProperty,
    updateProperty,
    deleteProperty,
    selectUsers,
    selectUser,
    insertUser
}