const mongo = require('mongoose');

async function connect() {
   try {
      await mongo.connect(
         'mongodb://durand:123123123@ac-ggz97ay-shard-00-00.tjgpyqt.mongodb.net:27017,ac-ggz97ay-shard-00-01.tjgpyqt.mongodb.net:27017,ac-ggz97ay-shard-00-02.tjgpyqt.mongodb.net:27017/senior-project?ssl=true&replicaSet=atlas-vgv4ao-shard-0&authSource=admin&retryWrites=true&w=majority',
         {
            useNewUrlParser: true,
            useUnifiedTopology: true,
         },
      );
      console.log('Connection Succes!!!');
   } catch (error) {
      console.log('Connection Failed!!!');
   }
}

module.exports = { connect };

// mongodb+srv://durand:<password>@cluster0.llxjqcl.mongodb.net/?retryWrites=true&w=majority
