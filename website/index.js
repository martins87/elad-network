(async () => {
    const db = require('./dbConnTest');
    console.log('Connected to DB and running...');

    await db.insertProperty();
    var properties = await db.selectProperties();
    console.log('Properties: ', properties);

    // await db.deleteProperty();
    // properties = await db.selectProperties();
    // console.log('Properties: ', properties);
})();