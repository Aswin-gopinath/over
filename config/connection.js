const mongoClient=require('mongodb').MongoClient


const state=
{
    db:null 
}


module.exports.connect=function(done){
    const url='mongodb+srv://ashwin:ashwin123@cluster0.rfizy5m.mongodb.net'
    const dbname='project'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

 
module.exports.get = function(){
    return state.db
}